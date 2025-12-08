import React, { useState, useRef, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { ChartContainer, RiskMeter } from '../../components/UI';
import { useData } from '../../hooks/useData';
import { loadNDMAData } from '../../services/dataLoader';
import { predictFireRisk } from '../../services/fireRiskService';
import { searchCities } from '../../services/weatherService';
import { searchLocation } from '../../services/geocodingService';
import { Flame, AlertTriangle, Shield, Thermometer, Wind, Droplets, Map, Calendar, Globe, Search, Loader2, TrendingUp } from 'lucide-react';

const FireRisk = () => {
  const { data: ndmaData, loading, error } = useData(loadNDMAData);

  // Fire prediction state
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);

  // Location search state
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);

  // Date state
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day, setDay] = useState(today.getDate());

  const searchTimeoutRef = useRef(null);

  // Handle location search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (locationQuery.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearchingLocation(true);
      try {
        const [citiesResult, locationResult] = await Promise.allSettled([
          searchCities(locationQuery),
          searchLocation(locationQuery).then(result => [{
            name: result.name,
            latitude: result.latitude,
            longitude: result.longitude,
            region: result.name
          }])
        ]);

        const suggestions = [];

        if (citiesResult.status === 'fulfilled' && citiesResult.value) {
          suggestions.push(...citiesResult.value.map(city => ({
            name: city.name,
            latitude: city.latitude,
            longitude: city.longitude,
            region: city.region || city.country
          })));
        }

        if (locationResult.status === 'fulfilled' && locationResult.value) {
          suggestions.push(...locationResult.value);
        }

        // Remove duplicates
        const uniqueSuggestions = suggestions.filter((item, index, self) =>
          index === self.findIndex((t) =>
            Math.abs(t.latitude - item.latitude) < 0.001 &&
            Math.abs(t.longitude - item.longitude) < 0.001
          )
        );

        setLocationSuggestions(uniqueSuggestions.slice(0, 5));
      } catch (error) {
        console.error('Error searching location:', error);
      } finally {
        setSearchingLocation(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [locationQuery]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setLocationQuery(location.name);
    setLocationSuggestions([]);
  };

  const handlePredictionSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      setPredictionError('Please select a location from the suggestions');
      return;
    }

    setPredictionLoading(true);
    setPredictionError(null);
    setPredictionResult(null);

    try {
      const predictionData = {
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        location: selectedLocation.name,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      };

      const result = await predictFireRisk(predictionData);
      setPredictionResult(result);
    } catch (err) {
      setPredictionError(err.message || 'Failed to get fire risk prediction');
    } finally {
      setPredictionLoading(false);
    }
  };

  // Static seasonal fire risk data (mock data)
  const seasonalRiskData = [
    { month: 'Jan', risk: 20 },
    { month: 'Feb', risk: 35 },
    { month: 'Mar', risk: 50 },
    { month: 'Apr', risk: 75 },
    { month: 'May', risk: 90 },
    { month: 'Jun', risk: 95 },
    { month: 'Jul', risk: 60 },
    { month: 'Aug', risk: 40 },
    { month: 'Sep', risk: 55 },
    { month: 'Oct', risk: 70 },
    { month: 'Nov', risk: 45 },
    { month: 'Dec', risk: 25 },
  ];

  // Prevention tips
  const preventionTips = [
    {
      title: 'Create Defensible Space',
      desc: 'Clear vegetation and dry debris within 30 feet of your home.',
      icon: <Shield className="w-6 h-6 text-emerald-400" />,
      color: 'emerald'
    },
    {
      title: 'Report Smoke Immediately',
      desc: 'Call emergency services (1122) if you spot smoke or unattended fire.',
      icon: <AlertTriangle className="w-6 h-6 text-orange-400" />,
      color: 'orange'
    },
    {
      title: 'Safe Debris Disposal',
      desc: 'Never burn trash or leaves during dry, windy conditions.',
      icon: <Flame className="w-6 h-6 text-rose-400" />,
      color: 'rose'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Generate days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (loading) {
    return <div className="p-6 text-white animate-pulse">Loading fire risk data...</div>;
  }

  if (error) {
    return <div className="p-6 text-risk-critical">Error loading data: {error}</div>;
  }

  // Calculate average risk score from provincial data
  const provinces = ndmaData?.provinces ? Object.values(ndmaData.provinces) : [];
  const highRiskCount = provinces.filter(p => p.risk_level === 'High').length;
  const mediumRiskCount = provinces.filter(p => p.risk_level === 'Medium').length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold font-heading text-white mb-2">Fire Risk Assessment</h1>
        <p className="text-gray-400 font-body">AI-powered wildfire risk prediction and prevention analysis</p>
      </motion.div>

      {/* Fire Risk Prediction Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Input Form */}
        <div className="lg:col-span-2 bg-background-light rounded-lg p-6 border border-background-lighter">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Map className="w-6 h-6" />
            Fire Risk Prediction
          </h2>

          <form onSubmit={handlePredictionSubmit} className="space-y-6">
            {/* Location Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setSelectedLocation(null);
                  }}
                  placeholder="Search for a city or location..."
                  className="w-full bg-background text-white px-4 py-2 pr-10 rounded border border-gray-700 focus:border-primary focus:outline-none"
                  required
                />
                {searchingLocation && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                )}
                {!searchingLocation && (
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                )}
              </div>

              {/* Location Suggestions Dropdown */}
              {locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background-light border border-background-lighter rounded-lg shadow-lg max-h-60 overflow-auto">
                  {locationSuggestions.map((location, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleLocationSelect(location)}
                      className="w-full text-left px-4 py-2 hover:bg-background text-white border-b border-background-lighter last:border-b-0"
                    >
                      <div className="font-medium">{location.name}</div>
                      {location.region && (
                        <div className="text-xs text-gray-400">{location.region}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Location Display */}
              {selectedLocation && (
                <div className="mt-2 p-3 bg-background rounded border border-gray-700">
                  <div className="text-sm text-gray-300">
                    <span className="text-white font-semibold">{selectedLocation.name}</span>
                    {selectedLocation.region && (
                      <span className="ml-2 text-gray-400">({selectedLocation.region})</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Coordinates: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                  </div>
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    min="1940"
                    max={new Date().getFullYear() + 5}
                    className="w-full bg-background text-white px-4 py-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Month</label>
                  <select
                    value={month}
                    onChange={(e) => {
                      setMonth(parseInt(e.target.value));
                      const daysInNewMonth = new Date(year, parseInt(e.target.value), 0).getDate();
                      if (day > daysInNewMonth) setDay(daysInNewMonth);
                    }}
                    className="w-full bg-background text-white px-4 py-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Day</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(parseInt(e.target.value))}
                    className="w-full bg-background text-white px-4 py-2 rounded border border-gray-700 focus:border-primary focus:outline-none"
                    required
                  >
                    {daysArray.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={predictionLoading || !selectedLocation}
              className="w-full bg-risk-critical hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {predictionLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Fetching Weather Data & Predicting...
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5" />
                  Predict Fire Risk
                </>
              )}
            </button>

            {predictionError && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {predictionError}
              </div>
            )}
          </form>
        </div>

        {/* Prediction Results */}
        <div className="bg-background-light rounded-lg p-6 border border-background-lighter">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Prediction Results</h3>
          {predictionResult ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <RiskMeter
                  value={predictionResult.risk_percentage}
                  label={`${predictionResult.risk_percentage}% Risk`}
                  size="lg"
                />
              </div>
              <div className="mt-6 space-y-4">
                <div className={`bg-background p-4 rounded-lg border ${predictionResult.fire_risk ? 'border-risk-critical' : 'border-green-500'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Prediction</span>
                    <span className={`text-lg font-bold ${predictionResult.fire_risk
                        ? 'text-risk-critical'
                        : 'text-green-500'
                      }`}>
                      {predictionResult.message}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Probability</span>
                    <span className="text-white font-bold">{predictionResult.risk_percentage}%</span>
                  </div>
                </div>

                {predictionResult.weather_data && (
                  <>
                    <div className="bg-background p-4 rounded-lg border border-background-lighter">
                      <div className="text-sm text-gray-400 mb-2">Location</div>
                      <div className="text-white font-semibold">{predictionResult.weather_data.location}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {predictionResult.weather_data.latitude.toFixed(4)}, {predictionResult.weather_data.longitude.toFixed(4)}
                      </div>
                    </div>
                    <div className="bg-background p-4 rounded-lg border border-background-lighter">
                      <div className="text-sm text-gray-400 mb-2">Weather Conditions</div>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div className="flex justify-between">
                          <span>Max Temp:</span>
                          <span className="text-white">{predictionResult.weather_data.temperature_max_c?.toFixed(1) || predictionResult.weather_data.MAX_TEMP?.toFixed(1)}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Min Temp:</span>
                          <span className="text-white">{predictionResult.weather_data.temperature_min_c?.toFixed(1) || predictionResult.weather_data.MIN_TEMP?.toFixed(1)}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wind Speed:</span>
                          <span className="text-white">{predictionResult.weather_data.wind_speed_kmh?.toFixed(1)} km/h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Precipitation:</span>
                          <span className="text-white">{predictionResult.weather_data.precipitation_mm?.toFixed(1)} mm</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Enter location and date, then click "Predict Fire Risk" to see results</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Top Stats Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="bg-background-light/50 backdrop-blur-md rounded-xl p-6 border border-white/5 shadow-glass flex items-center justify-between group hover:border-risk-critical/30 transition-colors">
          <div>
            <div className="text-gray-400 text-sm mb-1 font-body">High Risk Areas</div>
            <div className="text-3xl font-bold font-heading text-risk-critical">{highRiskCount} Regions</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-risk-critical/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Flame className="w-6 h-6 text-risk-critical" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-background-light/50 backdrop-blur-md rounded-xl p-6 border border-white/5 shadow-glass flex items-center justify-between group hover:border-risk-high/30 transition-colors">
          <div>
            <div className="text-gray-400 text-sm mb-1 font-body">Moderate Risk Areas</div>
            <div className="text-3xl font-bold font-heading text-risk-high">{mediumRiskCount} Regions</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-risk-high/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-6 h-6 text-risk-high" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-background-light/50 backdrop-blur-md rounded-xl p-6 border border-white/5 shadow-glass flex items-center justify-between group hover:border-risk-medium/30 transition-colors">
          <div>
            <div className="text-gray-400 text-sm mb-1 font-body">Avg. Temperature</div>
            <div className="text-3xl font-bold font-heading text-risk-medium">34°C</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-risk-medium/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Thermometer className="w-6 h-6 text-risk-medium" />
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fire Danger Index Meter */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 bg-background-light/50 backdrop-blur-md rounded-xl p-6 border border-white/5 shadow-glass flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-risk-high/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <h3 className="text-xl font-bold font-heading text-white mb-6 relative z-10">National Fire Danger Index</h3>
          <RiskMeter value={75} label="High Danger" size="lg" />

          <div className="grid grid-cols-3 gap-4 w-full mt-8">
            <div className="text-center">
              <div className="flex justify-center mb-1"><Wind className="w-4 h-4 text-gray-400" /></div>
              <div className="text-sm font-bold text-white">15 km/h</div>
              <div className="text-xs text-gray-500">Wind</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1"><Droplets className="w-4 h-4 text-gray-400" /></div>
              <div className="text-sm font-bold text-white">12%</div>
              <div className="text-xs text-gray-500">Humidity</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-1"><Thermometer className="w-4 h-4 text-gray-400" /></div>
              <div className="text-sm font-bold text-white">38°C</div>
              <div className="text-xs text-gray-500">Temp</div>
            </div>
          </div>
        </motion.div>

        {/* Seasonal Risk Chart */}
        <div className="lg:col-span-2">
          <ChartContainer title="Seasonal Fire Risk Trends">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={seasonalRiskData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="#EF4444"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRisk)"
                  name="Risk Level"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Areas List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background-light/50 backdrop-blur-md rounded-xl p-6 border border-white/5 shadow-glass"
        >
          <h3 className="text-xl font-bold font-heading text-white mb-4">High Risk Areas</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {ndmaData?.provinces && Object.entries(ndmaData.provinces).map(([name, data], index) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
              >
                <div>
                  <div className="font-semibold text-white">{name}</div>
                  <div className="text-xs text-gray-400">Vulnerable Districts: {data.vulnerable_districts.length}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${data.risk_level === 'High' ? 'bg-risk-critical/10 text-risk-critical border-risk-critical/20' :
                    data.risk_level === 'Medium' ? 'bg-risk-high/10 text-risk-high border-risk-high/20' :
                      'bg-risk-low/10 text-risk-low border-risk-low/20'
                  }`}>
                  {data.risk_level} Risk
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Prevention Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-background-light/50 backdrop-blur-md rounded-xl p-6 border border-white/5 shadow-glass"
        >
          <h3 className="text-xl font-bold font-heading text-white mb-4">Prevention Guidelines</h3>
          <div className="space-y-4">
            {preventionTips.map((tip, index) => (
              <div key={index} className="flex gap-4 p-4 bg-background/50 rounded-lg border border-white/5 hover:border-primary/30 transition-colors group">
                <div className={`flex-shrink-0 mt-1 p-2 rounded-lg bg-${tip.color}-500/10 group-hover:bg-${tip.color}-500/20 transition-colors`}>
                  {tip.icon}
                </div>
                <div>
                  <h4 className="font-bold font-heading text-white mb-1 group-hover:text-primary transition-colors">{tip.title}</h4>
                  <p className="text-sm text-gray-400 font-body">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FireRisk;
