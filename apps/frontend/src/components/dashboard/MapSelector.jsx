import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PAKISTAN_BOUNDS, PAKISTAN_CITIES } from '../../data/pakistanCities';
import { NDMA_OFFICES } from '../../data/ndmaRegionalOffices';
import { findNearestCity, formatDistance } from '../../utils/mapUtils';
import { fetchCityNameFromCoords } from '../../services/weatherService';
import { fetchFloodData, DAM_LOCATIONS, BARRAGE_LOCATIONS, RIVER_STATIONS, getRiskColor } from '../../services/waterDataService';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * MapSelector with autocomplete search, reverse geocoding, and risk heatmap
 */
const MapSelector = ({ selectedLocation, citiesWeather = [], onLocationSelect }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const cityMarkersRef = useRef([]);
  const damMarkersRef = useRef([]);
  const heatmapLayersRef = useRef([]);
  const lastPositionRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [showCityMarkers, setShowCityMarkers] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [floodData, setFloodData] = useState(null); // New state for flood data
  const [error, setError] = useState(null);

  const onLocationSelectRef = useRef(onLocationSelect);

  // Update ref when prop changes
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Initialize map ONCE
  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      try {
        const map = L.map(mapContainer.current, {
          zoomControl: false,
          attributionControl: true
        }).setView(
          [PAKISTAN_BOUNDS.center.latitude, PAKISTAN_BOUNDS.center.longitude],
          PAKISTAN_BOUNDS.zoom
        );

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          minZoom: 5
        }).addTo(map);

        mapRef.current = map;
        setMapLoaded(true);

        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          if (onLocationSelectRef.current) {
            // Immediately show coordinates while fetching name
            onLocationSelectRef.current(lat, lng, `Loading location...`);

            // Fetch real name
            try {
              const cityName = await fetchCityNameFromCoords(lat, lng);
              // Update with real name
              onLocationSelectRef.current(lat, lng, cityName);
            } catch (err) {
              // Fallback
              onLocationSelectRef.current(lat, lng, `Custom Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`);
            }
          }
        });

        return () => {
          if (map) {
            map.remove();
            mapRef.current = null;
          }
        };
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(err.message);
      }
    }
  }, []); // Empty deps - truly only run once

  // Update marker
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !selectedLocation) return;

    const posKey = `${selectedLocation.latitude.toFixed(6)},${selectedLocation.longitude.toFixed(6)},${selectedLocation.name}`;
    if (lastPositionRef.current === posKey) return;
    lastPositionRef.current = posKey;

    // Only remove marker if position changed (not just name)
    const positionChanged = !markerRef.current || 
      markerRef.current.getLatLng().lat.toFixed(6) !== selectedLocation.latitude.toFixed(6) ||
      markerRef.current.getLatLng().lng.toFixed(6) !== selectedLocation.longitude.toFixed(6);

    if (positionChanged && markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    try {
      const nearestCity = findNearestCity(
        selectedLocation.latitude,
        selectedLocation.longitude,
        NDMA_OFFICES
      );

      const popupContent = `
          <div style="padding: 12px; min-width: 200px; font-family: sans-serif;">
            <div style="margin-bottom: 8px;">
              <strong style="color:#2563eb; font-size: 15px; display:flex; align-items:center; gap:6px;">
                📍 ${selectedLocation.name === 'Loading location...' ? 'Identifying Location...' : selectedLocation.name}
              </strong>
            </div>
            ${nearestCity ? `
              <div style="background: #f1f5f9; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
                 <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 2px; display:flex; align-items:center; gap:4px;">
                    🛡️ Nearest Relief Camp
                 </div>
                 <div style="font-size: 13px; font-weight: 600; color: #0f172a;">${nearestCity.name}</div>
                 <div style="font-size: 12px; color: #475569; display: flex; justify-content: space-between; margin-top: 2px;">
                    <span>Distance: <strong>${formatDistance(nearestCity.distance)}</strong></span>
                    ${nearestCity.contact ? `<span style="color:#2563eb; font-weight:600;">📞 ${nearestCity.contact}</span>` : ''}
                 </div>
              </div>
            ` : ''}
            <div style="font-size: 11px; color: #94a3b8; display:flex; justify-content:space-between; align-items:center;">
              <span>${selectedLocation.latitude.toFixed(4)}°N, ${selectedLocation.longitude.toFixed(4)}°E</span>
              <span style="background:#22c55e; color:white; padding:1px 4px; border-radius:3px; font-size:9px;">LIVE</span>
            </div>
          </div>
        `;

      if (positionChanged) {
        // Create new marker
        const marker = L.marker([selectedLocation.latitude, selectedLocation.longitude])
          .bindPopup(popupContent)
          .addTo(mapRef.current);

        markerRef.current = marker;
        marker.openPopup();
      } else if (markerRef.current) {
        // Just update popup content
        markerRef.current.setPopupContent(popupContent);
        if (markerRef.current.isPopupOpen()) {
          markerRef.current.openPopup();
        }
      }
    } catch (err) {
      console.error('Error adding marker:', err);
    }
  }, [selectedLocation?.latitude, selectedLocation?.longitude, selectedLocation?.name, mapLoaded]);

  // Fetch Flood Data on Mount
  useEffect(() => {
    const loadWaterData = async () => {
      try {
        const data = await fetchFloodData();
        setFloodData(data);
      } catch (err) {
        console.error("Failed to load flood monitoring data", err);
      }
    };
    loadWaterData();
  }, []);

  // Water Points Makers (Dams, Barrages, Stations)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Clear existing
    damMarkersRef.current.forEach(m => {
      try { mapRef.current.removeLayer(m); } catch (e) { }
    });
    damMarkersRef.current = [];

    // Helper: Create and Add Markers
    const addMarker = (location, type, iconStr, riskData) => {
      const color = riskData ? getRiskColor(riskData.risk) : '#64748b';

      const icon = L.divIcon({
        className: '',
        html: `
              <div style="background: white; border-radius: 50%; padding: 3px; box-shadow: 0 3px 5px rgba(0,0,0,0.2); border: 2px solid ${color}; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                ${iconStr}
              </div>
            `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const popupContent = riskData ? `
            <div style="min-width: 200px; font-family: sans-serif;">
                <div style="background: ${color}15; padding: 8px; border-bottom: 2px solid ${color}; border-radius: 6px 6px 0 0;">
                    <div style="font-size: 9px; font-weight: 700; color: ${color}; text-transform: uppercase;">${type}</div>
                    <div style="font-size: 14px; font-weight: 800; color: #1e293b;">${location.name}</div>
                    <div style="font-size: 10px; color: #64748b;">${location.river}</div>
                </div>
                <div style="padding: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 11px; color: #475569;">Inflow</span>
                        <span style="font-size: 11px; font-weight: 700; color: #334155;">${riskData.inflow.toLocaleString()} Cs</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 11px; color: #475569;">Outflow</span>
                        <span style="font-size: 11px; font-weight: 700; color: #334155;">${riskData.outflow.toLocaleString()} Cs</span>
                    </div>
                    ${riskData.level ? `
                    <div style="background: #f1f5f9; padding: 6px; border-radius: 4px; display:flex; justify-content:space-between;">
                        <span style="font-size: 10px; color: #64748b;">Level</span>
                        <span style="font-size: 11px; font-weight: 800; color: #0f172a;">${riskData.level.toFixed(1)} ft</span>
                    </div>
                    ` : ''}
                    <div style="margin-top:8px; text-align:right;">
                        <span style="font-size: 9px; font-weight: 700; color: white; background: ${color}; padding: 2px 6px; border-radius: 10px;">
                            ${riskData.risk}
                        </span>
                    </div>
                </div>
            </div>
        ` : `<div style="padding:8px;"><strong>${location.name}</strong><br/><span style="font-size:10px;">Loading...</span></div>`;

      const marker = L.marker([location.latitude, location.longitude], { icon: icon })
        .bindPopup(popupContent)
        .addTo(mapRef.current);

      damMarkersRef.current.push(marker);
    };

    // 1. Dams
    DAM_LOCATIONS.forEach(loc => {
      let data = floodData?.risks ? floodData.risks[loc.id] : null;
      addMarker(loc, 'RESERVOIR', '🌊', data);
    });

    // 2. Barrages
    BARRAGE_LOCATIONS.forEach(loc => {
      let data = floodData?.risks?.barrages ? floodData.risks.barrages[loc.id] : null;
      addMarker(loc, 'BARRAGE', '🏗️', data);
    });

    // 3. Stations
    RIVER_STATIONS.forEach(loc => {
      let data = floodData?.risks?.stations ? floodData.risks.stations[loc.id] : null;
      addMarker(loc, 'RIVER STATION', '📏', data);
    });

  }, [mapLoaded, floodData]);

  // Division heatmap
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    heatmapLayersRef.current.forEach(layer => {
      try { mapRef.current.removeLayer(layer); } catch (e) { }
    });
    heatmapLayersRef.current = [];

    if (!showHeatmap) return;

    try {
      const riverFactor = floodData && floodData.risks && floodData.risks.rim_stations
        ? (floodData.risks.rim_stations.total_inflow / 400000) * 100
        : 50;

      const provinces = [
        {
          name: 'Punjab',
          center: [31.1704, 72.7097],
          baseTemp: 35,
          rainfallTrend: 15,
          soilSaturation: 60,
          riverLevel: Math.min(100, riverFactor * 1.2),
          desc: 'Dense population & river network'
        },
        {
          name: 'Sindh',
          center: [26.0, 68.5],
          baseTemp: 38,
          rainfallTrend: 40,
          soilSaturation: 85,
          riverLevel: Math.min(100, riverFactor * 1.5),
          desc: 'Coastal & high flood vulnerability'
        },
        {
          name: 'KP',
          center: [34.5, 72.0],
          baseTemp: 28,
          rainfallTrend: 25,
          soilSaturation: 45,
          riverLevel: Math.min(100, riverFactor * 0.8),
          desc: 'Flash flood prone mountainous region'
        },
        {
          name: 'Balochistan',
          center: [28.5, 65.0],
          baseTemp: 32,
          rainfallTrend: -10,
          soilSaturation: 20,
          riverLevel: 30, // Mostly separate
          desc: 'Arid climate & sparse population'
        }
      ];

      provinces.forEach(province => {
        const heatScore = Math.max(0, Math.min(100, ((province.baseTemp - 20) / 25) * 100));
        const floodScore = (Math.max(0, province.rainfallTrend + 50) + province.soilSaturation + province.riverLevel) / 3;
        const fluctuation = (Math.random() * 6) - 3;
        const totalRisk = (heatScore * 0.4) + (floodScore * 0.6) + fluctuation;
        const finalRisk = Math.max(0, Math.min(100, totalRisk));

        const getColor = (r) => {
          if (r > 75) return { bg: '#dc2626', label: 'HIGH', class: 'text-red-600' };
          if (r > 50) return { bg: '#f59e0b', label: 'ELEVATED', class: 'text-amber-500' };
          if (r > 30) return { bg: '#3b82f6', label: 'MODERATE', class: 'text-blue-500' };
          return { bg: '#10b981', label: 'LOW', class: 'text-emerald-500' };
        };
        const riskInfo = getColor(finalRisk);

        const circle = L.circle(province.center, {
          radius: 160000,
          fillColor: riskInfo.bg,
          fillOpacity: 0.25,
          stroke: true,
          color: riskInfo.bg,
          weight: 2,
          opacity: 0.6
        }).bindPopup(`
          <div style="padding: 12px; min-width: 180px; font-family: sans-serif;">
            <div style="margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
              <strong style="color: ${riskInfo.bg}; font-size: 15px; display:flex; justify-content:space-between; align-items:center;">
                ${province.name}
                <span style="font-size:10px; background:${riskInfo.bg}20; padding:2px 6px; border-radius:10px;">${riskInfo.label}</span>
              </strong>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${province.desc}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; color: #334155;">
              <div style="background:#f8fafc; padding:4px; border-radius:4px;">
                <div style="color:#94a3b8; font-size:10px;">Avg Temp</div>
                <strong>${province.baseTemp}°C</strong>
              </div>
              <div style="background:#f8fafc; padding:4px; border-radius:4px;">
                <div style="color:#94a3b8; font-size:10px;">Rainfall</div>
                <strong>${province.rainfallTrend > 0 ? '+' : ''}${province.rainfallTrend}%</strong>
              </div>
              <div style="background:#f8fafc; padding:4px; border-radius:4px;">
                <div style="color:#94a3b8; font-size:10px;">River Levels</div>
                <strong>${province.riverLevel.toFixed(0)}% Cap</strong>
              </div>
              <div style="background:#f8fafc; padding:4px; border-radius:4px;">
                <div style="color:#94a3b8; font-size:10px;">Soil Sat</div>
                <strong>${province.soilSaturation}%</strong>
              </div>
            </div>

            <div style="margin-top: 8px; font-size: 10px; text-align: right; color: #94a3b8;">
              Risk Score: <strong>${finalRisk.toFixed(1)}/100</strong>
            </div>
          </div>
        `);

        circle.addTo(mapRef.current);
        heatmapLayersRef.current.push(circle);
      });
    } catch (error) {
      console.error('Error creating heatmap:', error);
    }
  }, [mapLoaded, showHeatmap, floodData]);

  // City markers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    if (!showCityMarkers || !Array.isArray(citiesWeather) || citiesWeather.length === 0) {
      cityMarkersRef.current.forEach(m => {
        try { mapRef.current?.removeLayer(m); } catch (e) { }
      });
      cityMarkersRef.current = [];
      return;
    }

    try {
      cityMarkersRef.current.forEach(m => {
        try { mapRef.current.removeLayer(m); } catch (e) { }
      });
      cityMarkersRef.current = [];

      const majorCities = citiesWeather.filter(city =>
        ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad', 'Rawalpindi'].includes(city.name)
      );

      majorCities.forEach(city => {
        if (!city.weather?.current) return;

        const temp = city.weather.current.temperature;
        const color = temp > 30 ? '#ef4444' : temp > 20 ? '#f59e0b' : temp > 10 ? '#10b981' : '#3b82f6';

        const cityIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              width: 12px;
              height: 12px;
              background: ${color};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        const marker = L.marker([city.latitude, city.longitude], { icon: cityIcon })
          .bindPopup(`
            <div style="padding: 6px;">
              <strong>${city.name}</strong><br/>
              <span style="color:${color};font-weight:bold;">${temp}°C</span>
            </div>
          `)
          .addTo(mapRef.current);

        cityMarkersRef.current.push(marker);
      });
    } catch (error) {
      console.error('Error updating city markers:', error);
    }
  }, [citiesWeather, mapLoaded, showCityMarkers]);

  if (error) {
    return (
      <div className="relative w-full h-full bg-gray-100 rounded-lg flex items-center justify-center min-h-[400px]">
        <div className="text-center p-6">
          <p className="text-red-600 font-semibold mb-2">⚠️ Map Error</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full min-h-[400px]" />

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading Map...</p>
          </div>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="absolute top-4 right-4 z-[999] flex flex-col gap-2">
        {/* Reset View Button */}
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.setView(
                [PAKISTAN_BOUNDS.center.latitude, PAKISTAN_BOUNDS.center.longitude],
                PAKISTAN_BOUNDS.zoom
              );
            }
          }}
          className="bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold uppercase tracking-wider py-2 px-3 rounded shadow-md border border-gray-200 transition-colors flex items-center gap-2"
          title="Reset Map View"
        >
          <span>↺</span> Reset View
        </button>

        <button
          onClick={() => setShowCityMarkers(!showCityMarkers)}
          className={`px-3 py-2 rounded text-xs font-bold uppercase tracking-wider shadow-md border transition-colors flex items-center gap-2 ${showCityMarkers
            ? 'bg-blue-600 text-white border-blue-700'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
        >
          <span>{showCityMarkers ? '✓' : '○'}</span> Cities
        </button>

        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-3 py-2 rounded text-xs font-bold uppercase tracking-wider shadow-md border transition-colors flex items-center gap-2 ${showHeatmap
            ? 'bg-orange-600 text-white border-orange-700'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
        >
          <span>{showHeatmap ? '✓' : '○'}</span> Risk Map
        </button>
      </div>

      {/* Heatmap Legend - Enhanced with Context */}
      {showHeatmap && (
        <div className="absolute top-4 left-4 z-[999] bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100 max-w-[200px]">
          <h4 className="text-[11px] font-extrabold text-gray-800 uppercase tracking-widest mb-1 border-b border-gray-200 pb-2">
            ⚠️ Regional Risk Index
          </h4>
          <p className="text-[10px] text-gray-500 mb-3 leading-tight">
            Composite score: Heat Stress, Rainfall Trends, River Levels & Soil Saturation.
          </p>
          <div className="space-y-2">
            {[
              { color: '#10b981', label: 'Low Risk', desc: 'Safe levels' },
              { color: '#3b82f6', label: 'Moderate', desc: 'Standard monitoring' },
              { color: '#f59e0b', label: 'Elevated', desc: 'Pre-alert status' },
              { color: '#dc2626', label: 'High Risk', desc: 'Active monitoring req.' }
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm mt-0.5 flex-shrink-0" style={{ background: item.color }}></div>
                <div>
                  <span className="text-xs font-bold text-gray-700 block">{item.label}</span>
                  <span className="text-[9px] text-gray-400 block -mt-0.5">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSelector;
