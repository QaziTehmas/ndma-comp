import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock } from 'lucide-react';
import { searchLocation } from '../../services/geocodingService';
import { PAKISTAN_CITIES } from '../../data/pakistanCities';

const LocationSearch = ({ onLocationSelect, selectedLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentWeatherSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for locations
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Show Pakistan cities that match
    const matchingCities = PAKISTAN_CITIES.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(matchingCities.map(city => ({
      name: city.name,
      region: city.region,
      latitude: city.latitude,
      longitude: city.longitude,
      type: 'city'
    })));
    setShowDropdown(true);

    // Debounce API search
    searchTimeoutRef.current = setTimeout(async () => {
      if (query.length >= 3) {
        setLoading(true);
        try {
          const result = await searchLocation(query);
          if (result) {
            // Add to suggestions if not already there
            const exists = suggestions.some(s => 
              Math.abs(s.latitude - result.latitude) < 0.01 &&
              Math.abs(s.longitude - result.longitude) < 0.01
            );
            
            if (!exists) {
              setSuggestions(prev => [...prev, {
                name: result.name.split(',')[0],
                region: result.name,
                latitude: result.latitude,
                longitude: result.longitude,
                type: 'search'
              }]);
            }
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      }
    }, 500);
  };

  const handleSelectLocation = (location) => {
    // Save to recent searches
    const newRecent = [
      location,
      ...recentSearches.filter(r => r.name !== location.name)
    ].slice(0, 5);
    
    setRecentSearches(newRecent);
    localStorage.setItem('recentWeatherSearches', JSON.stringify(newRecent));

    // Update search input and notify parent
    setSearchQuery(location.name);
    setShowDropdown(false);
    onLocationSelect(location.latitude, location.longitude, location.name);
  };

  const handleFocus = () => {
    if (recentSearches.length > 0 && searchQuery.length === 0) {
      setShowDropdown(true);
    } else if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={handleFocus}
          placeholder="Search location (e.g., Lahore, Karachi)..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 mt-2 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {/* Recent Searches */}
          {searchQuery.length === 0 && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Recent Searches
              </div>
              {recentSearches.map((location, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleSelectLocation(location)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-sm text-white">{location.name}</div>
                    {location.region && (
                      <div className="text-xs text-gray-400">{location.region}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {suggestions.length > 0 && (
            <div className="py-2">
              {searchQuery.length > 0 && (
                <div className="px-3 py-1 text-xs text-gray-400">Suggestions</div>
              )}
              {suggestions.map((location, index) => (
                <button
                  key={`suggestion-${index}`}
                  onClick={() => handleSelectLocation(location)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-sm text-white">{location.name}</div>
                    {location.region && (
                      <div className="text-xs text-gray-400">{location.region}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {searchQuery.length >= 2 && suggestions.length === 0 && !loading && (
            <div className="px-3 py-4 text-sm text-gray-400 text-center">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
