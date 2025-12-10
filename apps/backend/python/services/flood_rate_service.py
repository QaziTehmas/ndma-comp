"""
Flood Rate Service
Provides location_flood_rate lookup based on coordinates via reverse geocoding.
Uses flood_rate.json data with district-level flood rates for Pakistan.
"""

import json
import os
import requests
from typing import Optional, Dict

class FloodRateService:
    """Service to lookup location_flood_rate based on coordinates"""
    
    NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
    
    def __init__(self):
        # Load flood_rate.json data from data/ directory
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        flood_rate_path = os.path.join(base_dir, 'data', 'flood_rate.json')
        
        with open(flood_rate_path, 'r', encoding='utf-8') as f:
            self.flood_data = json.load(f)
        
        self.default_values = self.flood_data.get('default_values', {})
        self.provinces = self.flood_data.get('provinces', {})
        
        # Build a quick lookup dictionary for all districts across provinces
        self.district_lookup = {}
        for province_name, province_data in self.provinces.items():
            districts = province_data.get('districts', {})
            for district_name, district_data in districts.items():
                # Normalize district name for lookup (lowercase, stripped)
                normalized_name = district_name.lower().strip()
                self.district_lookup[normalized_name] = {
                    'flood_rate': district_data.get('flood_rate', self.default_values.get('unknown_district', 0.05)),
                    'province': province_name,
                    'district': district_name,
                    'severity': district_data.get('severity', 'unknown'),
                    'notes': district_data.get('notes', '')
                }
        
        print(f"✅ Flood rate service loaded with {len(self.district_lookup)} districts")
    
    def reverse_geocode(self, latitude: float, longitude: float) -> Dict:
        """
        Use reverse geocoding to get location details from coordinates.
        
        Args:
            latitude: Latitude
            longitude: Longitude
            
        Returns:
            Dictionary with location details (district, state/province, country)
        """
        try:
            params = {
                'lat': latitude,
                'lon': longitude,
                'format': 'json',
                'addressdetails': 1,
                'zoom': 10  # District level
            }
            headers = {
                'User-Agent': 'NDMA-FloodWatch/1.0 (Flood Prediction System)'
            }
            
            response = requests.get(self.NOMINATIM_URL, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            address = data.get('address', {})
            
            # Try to extract district name from various fields
            district = (
                address.get('county') or 
                address.get('district') or 
                address.get('city') or
                address.get('town') or
                address.get('state_district') or
                address.get('municipality') or
                ''
            )
            
            province = address.get('state', '')
            country = address.get('country', '')
            
            return {
                'district': district,
                'province': province,
                'country': country,
                'display_name': data.get('display_name', '')
            }
            
        except Exception as e:
            print(f"⚠️ Reverse geocoding failed: {e}")
            return {
                'district': '',
                'province': '',
                'country': '',
                'display_name': ''
            }
    
    def lookup_flood_rate(self, district: str) -> Dict:
        """
        Lookup flood rate for a district.
        
        Args:
            district: District name
            
        Returns:
            Dictionary with flood_rate and metadata
        """
        normalized = district.lower().strip()
        
        # Try exact match
        if normalized in self.district_lookup:
            return self.district_lookup[normalized]
        
        # Try partial match
        for key, value in self.district_lookup.items():
            if normalized in key or key in normalized:
                return value
        
        # Try matching just the first word (e.g., "D.G. Khan" -> "d.g.")
        first_word = normalized.split()[0] if normalized else ''
        for key, value in self.district_lookup.items():
            if first_word and first_word in key:
                return value
        
        # Return default value
        return {
            'flood_rate': self.default_values.get('unknown_district', 0.05),
            'province': 'Unknown',
            'district': district,
            'severity': 'unknown',
            'notes': 'District not found in database, using default flood rate'
        }
    
    def get_location_flood_rate(self, latitude: float, longitude: float, location_name: str = "") -> Dict:
        """
        Get location_flood_rate for coordinates.
        
        Steps:
        1. Use reverse geocoding to get district name from lat/lon
        2. Lookup district in flood_rate.json
        3. Return flood_rate value, with fallback to default if not found
        
        Args:
            latitude: Latitude
            longitude: Longitude
            location_name: Optional location name (used as fallback for lookup)
            
        Returns:
            Dictionary with:
            - location_flood_rate: The flood rate value (0-1)
            - district: District name
            - province: Province name
            - severity: Severity level
            - notes: Additional notes
        """
        # Step 1: Reverse geocode to get district
        geo_result = self.reverse_geocode(latitude, longitude)
        district = geo_result.get('district', '')
        
        # Step 2 & 3: Lookup flood rate
        if district:
            result = self.lookup_flood_rate(district)
        elif location_name:
            # Fallback to location name if reverse geocoding didn't return district
            result = self.lookup_flood_rate(location_name)
        else:
            result = self.lookup_flood_rate('')
        
        # Add the geocoded info
        result['geocoded_district'] = district
        result['geocoded_province'] = geo_result.get('province', '')
        
        return {
            'location_flood_rate': result['flood_rate'],
            'district': result.get('district', district),
            'province': result.get('province', geo_result.get('province', '')),
            'severity': result.get('severity', 'unknown'),
            'notes': result.get('notes', '')
        }


# Singleton instance
_flood_rate_service = None

def get_flood_rate_service() -> FloodRateService:
    """Get or create the singleton flood rate service instance."""
    global _flood_rate_service
    if _flood_rate_service is None:
        _flood_rate_service = FloodRateService()
    return _flood_rate_service
