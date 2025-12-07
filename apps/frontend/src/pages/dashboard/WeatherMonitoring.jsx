import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Menu, X } from 'lucide-react';
import MapSelector from '../../components/dashboard/MapSelector';
import WeatherSidebar from '../../components/dashboard/WeatherSidebar';
import ChartsPanel from '../../components/dashboard/ChartsPanel';
import { useRealTimeWeather } from '../../hooks/useRealTimeWeather';
import { useEarthquakeData } from '../../hooks/useEarthquakeData';
import { useAirQuality } from '../../hooks/useAirQuality';
import { fetchMultipleCities } from '../../services/weatherService';
import { PAKISTAN_CITIES, PAKISTAN_BOUNDS } from '../../data/pakistanCities';
import { motion, AnimatePresence } from 'framer-motion';
import DownloadReportButton from '../../components/DownloadReportButton';

/**
 * WeatherMonitoring - Professional Dashboard with Advanced Animations
 */
const WeatherMonitoring = () => {
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: PAKISTAN_BOUNDS.center.latitude,
    longitude: PAKISTAN_BOUNDS.center.longitude,
    name: 'Pakistan Center'
  });

  const [citiesWeather, setCitiesWeather] = useState([]);
  const [chartsVisible, setChartsVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For mobile responsiveness if needed

  // Custom hooks for data
  const {
    weatherData,
    loading: weatherLoading,
    error: weatherError,
    lastUpdated: weatherLastUpdated,
    refetch: refetchWeather
  } = useRealTimeWeather(selectedLocation.latitude, selectedLocation.longitude);

  const {
    summary: earthquakeSummary,
    loading: earthquakeLoading
  } = useEarthquakeData(selectedLocation.latitude, selectedLocation.longitude);

  const {
    airQuality,
    loading: airQualityLoading
  } = useAirQuality(selectedLocation.latitude, selectedLocation.longitude);

  const [riskSummary, setRiskSummary] = useState(null);

  useEffect(() => {
    const fetchRisk = async () => {
      if (!selectedLocation.name) return;
      try {
        setRiskSummary(null); // Reset
        const response = await fetch(`http://localhost:8000/api/history-risk?location=${encodeURIComponent(selectedLocation.name)}`);
        const data = await response.json();
        setRiskSummary(data.risk_analysis);
      } catch (e) {
        console.error("Risk fetch error", e);
      }
    };
    fetchRisk();
  }, [selectedLocation.name]);


  // Fetch weather for major cities
  useEffect(() => {
    const fetchCitiesData = async () => {
      const majorCities = PAKISTAN_CITIES.filter(city =>
        ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Multan', 'Faisalabad', 'Rawalpindi'].includes(city.name)
      );

      try {
        const weatherPromises = majorCities.map(city =>
          fetchMultipleCities([city])
            .then(results => ({ ...city, weather: results[0] }))
            .catch(() => ({ ...city, weather: null }))
        );

        const results = await Promise.all(weatherPromises);
        setCitiesWeather(results);
      } catch (error) {
        console.error('Error fetching cities weather:', error);
      }
    };

    fetchCitiesData();
    const interval = setInterval(fetchCitiesData, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  const handleLocationSelect = useCallback((latitude, longitude, name) => {
    setSelectedLocation({ latitude, longitude, name: name || 'Selected Location' });
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-6 w-[calc(100%+3rem)] bg-gray-950 overflow-hidden font-sans text-gray-100 selection:bg-blue-500/30">
      {/* Premium Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-3 flex items-center justify-between z-50 relative"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 rounded-full"></div>
            <Activity className="w-6 h-6 text-blue-400 relative z-10" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Weather Monitoring <span className="text-blue-500">Pro</span></h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Disaster Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {weatherLastUpdated && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-full border border-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-gray-400 font-mono">
                LIVE: {new Date(weatherLastUpdated).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </motion.header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Animated */}
        <motion.aside
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-80 flex-shrink-0 z-40"
        >
          <WeatherSidebar
            selectedLocation={selectedLocation}
            weatherData={weatherData}
            citiesWeather={citiesWeather}
            earthquakeSummary={earthquakeSummary}
            airQuality={airQuality}
            riskSummary={riskSummary}
            onLocationSelect={handleLocationSelect}
            onCitySelect={handleLocationSelect}
            loading={weatherLoading || earthquakeLoading || airQualityLoading}
            lastUpdated={weatherLastUpdated}
          />
        </motion.aside>

        {/* Right Section - Map + Charts */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Map Area - Takes remaining space when charts closed, or full height when charts overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 relative bg-gray-900 pb-2"
          >
            <MapSelector
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
              citiesWeather={citiesWeather}
            />

            {/* Overlay Gradient for smooth transition to sidebar */}
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-gray-900/50 to-transparent pointer-events-none z-[400]"></div>
          </motion.div>

          {/* Bottom Charts Panel */}
          <ChartsPanel
            weatherData={weatherData}
            isOpen={chartsVisible}
            onToggle={() => setChartsVisible(!chartsVisible)}
            selectedLocation={selectedLocation}
            seismicData={earthquakeSummary}
            airQuality={airQuality}
          />
        </main>
      </div>


      {/* Download Button with Context - Higher z-index to stay above all */}
      {/* <div className="absolute bottom-8 right-8 z-[2000]">
        <DownloadReportButton
          selectedLocation={selectedLocation}
          weatherData={weatherData}
          seismicData={earthquakeSummary}
          airQuality={airQuality}
        />
      </div> */}
    </div>
  );
};

export default WeatherMonitoring;
