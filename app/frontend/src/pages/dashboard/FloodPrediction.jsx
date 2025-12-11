import React, { useState, useRef, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { motion } from 'framer-motion';
import { ChartContainer, RiskMeter } from '../../components/UI';
import { useMultipleData } from '../../hooks/useData';
import { loadFloodHistory, loadNDMAData } from '../../services/dataLoader';
import { predictFlood, predictFloodCurrent } from '../../services/floodPredictionService';
import { searchLocation } from '../../services/geocodingService';
import { searchCities } from '../../services/weatherService';
import { Droplets, AlertTriangle, Map, TrendingUp, Calendar, Globe, Search, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const FloodPrediction = () => {
  const { theme } = useTheme();
  const [predictionResult, setPredictionResult] = useState(null);
  
  // Theme-aware chart colors
  const isDark = theme === 'dark';
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const chartGridColor = isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.1)';
  const chartTooltipBg = isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)';
  const chartTooltipText = isDark ? '#f1f5f9' : '#0f172a';
  const chartTooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simplified form state - only location and date
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);

  // Initialize with yesterday's date to ensure we have historical data
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [year, setYear] = useState(yesterday.getFullYear());
  const [month, setMonth] = useState(yesterday.getMonth() + 1);
  const [day, setDay] = useState(yesterday.getDate());

  const searchTimeoutRef = useRef(null);
  const locationInputRef = useRef(null);

  const { data } = useMultipleData({
    floodHistory: loadFloodHistory,
    ndmaData: loadNDMAData
  });

  const { floodHistory } = data;

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
        // Try both search methods
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
          // Filter to ensure only Pakistan locations
          const pakistanCities = citiesResult.value
            .filter(city => {
              const country = (city.country || '').toLowerCase();
              return country === 'pakistan' || country === 'pk';
            })
            .map(city => ({
              name: city.name,
              latitude: city.latitude,
              longitude: city.longitude,
              region: city.region || city.country
            }));
          suggestions.push(...pakistanCities);
        }

        if (locationResult.status === 'fulfilled' && locationResult.value) {
          // Ensure location is in Pakistan (double-check)
          const location = locationResult.value;
          if (Array.isArray(location)) {
            suggestions.push(...location);
          } else {
            suggestions.push(location);
          }
        }

        // Remove duplicates and filter by Pakistan bounds (23.6345 to 37.0841 lat, 60.8742 to 77.8375 lon)
        const uniqueSuggestions = suggestions
          .filter((item, index, self) =>
            index === self.findIndex((t) =>
              Math.abs(t.latitude - item.latitude) < 0.001 &&
              Math.abs(t.longitude - item.longitude) < 0.001
            )
          )
          .filter(item => {
            // Additional geographic bounds check for Pakistan
            const lat = item.latitude;
            const lon = item.longitude;
            return lat >= 23.6 && lat <= 37.1 && lon >= 60.8 && lon <= 77.9;
          });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      setError('Please select a location from the suggestions');
      return;
    }

    // Note: Future dates are allowed - the model can predict flood risk for upcoming dates
    // using forecast weather data or seasonal patterns

    setLoading(true);
    setError(null);
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

      const result = await predictFlood(predictionData);
      setPredictionResult(result);
    } catch (err) {
      let errorMessage = 'Failed to get prediction.';
      if (err.message) {
        if (err.message.includes('400')) {
          errorMessage = 'Invalid request. The selected date might not have weather data available. Please try a different date.';
        } else if (err.message.includes('future')) {
          errorMessage = 'Cannot predict for future dates. Please select a past date.';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate contributing factors based on weather data for visualization
  const getContributingFactors = () => {
    if (!predictionResult?.weather_data) return [];

    const weather = predictionResult.weather_data;
    const factors = [];

    if (weather.precipitation_sum > 50) {
      factors.push({
        factor: 'Heavy Precipitation',
        value: Math.min(100, (weather.precipitation_sum / 150) * 100)
      });
    }
    if (weather.precipitation_cumsum_7day > 300) {
      factors.push({
        factor: 'Cumulative Rainfall (7-day)',
        value: Math.min(100, (weather.precipitation_cumsum_7day / 700) * 100)
      });
    }
    if (weather.rain_sum > 50) {
      factors.push({
        factor: 'Rain Intensity',
        value: Math.min(100, (weather.rain_sum / 150) * 100)
      });
    }
    if (weather.precipitation_hours > 15) {
      factors.push({
        factor: 'Extended Rainfall Duration',
        value: Math.min(100, (weather.precipitation_hours / 24) * 100)
      });
    }
    if (weather.temperature_mean < 20 && weather.precipitation_sum > 30) {
      factors.push({
        factor: 'Low Temperature + Rain',
        value: Math.min(100, ((20 - weather.temperature_mean) / 10) * 50 + (weather.precipitation_sum / 100) * 50)
      });
    }
    if (weather.windspeed_max > 15) {
      factors.push({
        factor: 'Strong Winds',
        value: Math.min(100, (weather.windspeed_max / 30) * 100)
      });
    }

    return factors;
  };

  const factorsData = getContributingFactors();

  // Generate days in month
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Flood Prediction System</h1>
        <p className="text-text-secondary">AI-powered flood forecasting using historical weather data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2 bg-background-light rounded-lg p-6 border border-border-color">
          <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <Map className="w-6 h-6" />
            Prediction Parameters
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-text-secondary mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Location
              </label>
              <div className="relative">
                <input
                  ref={locationInputRef}
                  type="text"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setSelectedLocation(null);
                  }}
                  placeholder="Search for a city or location in Pakistan..."
                  className="w-full bg-background text-text-primary px-4 py-2 pr-10 rounded border border-border-color focus:border-primary focus:outline-none"
                  required
                />
                {searchingLocation && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-text-muted" />
                )}
                {!searchingLocation && (
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                )}
              </div>

              {/* Location Suggestions Dropdown */}
              {locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background-light border border-border-color rounded-lg shadow-lg max-h-60 overflow-auto">
                  {locationSuggestions.map((location, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleLocationSelect(location)}
                      className="w-full text-left px-4 py-2 hover:bg-background text-text-primary border-b border-border-color last:border-b-0"
                    >
                      <div className="font-medium">{location.name}</div>
                      {location.region && (
                        <div className="text-xs text-text-secondary">{location.region}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Location Display */}
              {selectedLocation && (
                <div className="mt-2 p-3 bg-background rounded border border-border-color">
                  <div className="text-sm text-text-secondary">
                    <span className="text-text-primary font-semibold">{selectedLocation.name}</span>
                    {selectedLocation.region && (
                      <span className="ml-2 text-text-muted">({selectedLocation.region})</span>
                    )}
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    Coordinates: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                  </div>
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-2">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => {
                      const newYear = parseInt(e.target.value);
                      const maxYear = new Date().getFullYear() + 5; // Allow up to 5 years in future
                      if (newYear >= 1940 && newYear <= maxYear) {
                        setYear(e.target.value);
                      } else if (newYear > maxYear) {
                        setYear(maxYear);
                      } else if (newYear < 1940 && e.target.value.length > 0) {
                        setYear(1940);
                      }
                    }}
                    min="1940"
                    max={new Date().getFullYear() + 5}
                    className="w-full bg-background text-text-primary px-4 py-2 rounded border border-border-color focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-2">Month</label>
                  <select
                    value={month}
                    onChange={(e) => {
                      setMonth(parseInt(e.target.value));
                      // Reset day if it exceeds days in new month
                      const daysInNewMonth = new Date(year, parseInt(e.target.value), 0).getDate();
                      if (day > daysInNewMonth) setDay(daysInNewMonth);
                    }}
                    className="w-full bg-background text-text-primary px-4 py-2 rounded border border-border-color focus:border-primary focus:outline-none"
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-2">Day</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(parseInt(e.target.value))}
                    className="w-full bg-background text-text-primary px-4 py-2 rounded border border-border-color focus:border-primary focus:outline-none"
                    required
                  >
                    {daysArray.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="submit"
                disabled={loading || !selectedLocation}
                className="bg-blue-600 hover:bg-blue-500 dark:text-text-primary text-slate-200 font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="dark:text-white text-slate-200 w-5 h-5" />
                    Predict Flood Risk
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  if (!selectedLocation) {
                    setError('Please select a location first');
                    return;
                  }
                  
                  setLoading(true);
                  setError(null);
                  setPredictionResult(null);
                  
                  try {
                    const result = await predictFloodCurrent({
                      location: selectedLocation.name,
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                    });
                    setPredictionResult(result);
                    // Update date fields to current date
                    const today = new Date();
                    setYear(today.getFullYear());
                    setMonth(today.getMonth() + 1);
                    setDay(today.getDate());
                  } catch (err) {
                    let errorMessage = 'Failed to get current prediction.';
                    if (err.message) {
                      errorMessage = err.message;
                    }
                    setError(errorMessage);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !selectedLocation}
                className="bg-emerald-700 hover:bg-emerald-600 dark:text-text-primary text-slate-200 font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Calendar className=" dark:text-white text-slate-200 w-5 h-5" />
                    Predict Current Status
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Results Display */}
        <div className="bg-background-light rounded-lg p-6 border border-border-color">
          <h3 className="text-xl font-bold text-text-primary mb-6 text-center">Prediction Results</h3>
          {predictionResult ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <RiskMeter
                  value={predictionResult.probability_percentage}
                  label={`${predictionResult.probability_percentage}% Probability`}
                  size="lg"
                />
              </div>
              <div className="mt-6 space-y-4">
                <div className="bg-background p-4 rounded-lg border border-border-color">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-muted text-sm">Prediction</span>
                    <span className={`text-lg font-bold ${predictionResult.flood_prediction === 1
                      ? 'text-risk-critical'
                      : 'text-green-500'
                      }`}>
                      {predictionResult.prediction_label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">Probability</span>
                    <span className="text-text-primary font-bold">{predictionResult.probability_percentage}%</span>
                  </div>
                </div>

                {predictionResult.weather_data && (
                  <>
                    <div className="bg-background p-4 rounded-lg border border-border-color">
                      <div className="text-sm text-text-muted mb-2">Location</div>
                      <div className="text-text-primary font-semibold">{predictionResult.weather_data.location}</div>
                      <div className="text-xs text-text-muted mt-1">
                        {predictionResult.weather_data.latitude.toFixed(4)}, {predictionResult.weather_data.longitude.toFixed(4)}
                      </div>
                    </div>
                    <div className="bg-background p-4 rounded-lg border border-border-color">
                      <div className="text-sm text-text-muted mb-2">Date</div>
                      <div className="text-text-primary font-semibold">
                        {predictionResult.weather_data.year}-{String(predictionResult.weather_data.month).padStart(2, '0')}-{String(predictionResult.weather_data.day).padStart(2, '0')}
                      </div>
                    </div>
                    {predictionResult.flood_rate_info && (
                      <div className="bg-background p-4 rounded-lg border border-border-color">
                        <div className="text-sm text-text-muted mb-2">Historical Flood Risk</div>
                        <div className="space-y-1 text-xs text-text-secondary">
                          <div className="flex justify-between">
                            <span>District:</span>
                            <span className="text-text-primary">{predictionResult.flood_rate_info.district || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Province:</span>
                            <span className="text-text-primary">{predictionResult.flood_rate_info.province || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Flood Rate:</span>
                            <span className={`font-semibold ${predictionResult.flood_rate_info.location_flood_rate > 0.15
                              ? 'text-risk-critical'
                              : predictionResult.flood_rate_info.location_flood_rate > 0.08
                                ? 'text-yellow-400'
                                : 'text-green-400'
                              }`}>
                              {(predictionResult.flood_rate_info.location_flood_rate * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Severity:</span>
                            <span className={`capitalize ${predictionResult.flood_rate_info.severity === 'very_high' || predictionResult.flood_rate_info.severity === 'high'
                              ? 'text-risk-critical'
                              : predictionResult.flood_rate_info.severity === 'moderate'
                                ? 'text-yellow-400'
                                : 'text-green-400'
                              }`}>
                              {predictionResult.flood_rate_info.severity?.replace('_', ' ') || 'N/A'}
                            </span>
                          </div>
                        </div>
                        {predictionResult.flood_rate_info.notes && (
                          <div className="mt-2 text-xs text-text-muted italic">
                            {predictionResult.flood_rate_info.notes}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="bg-background p-4 rounded-lg border border-border-color">
                      <div className="text-sm text-text-muted mb-2">Weather Summary</div>
                      <div className="space-y-1 text-xs text-text-secondary">
                        <div className="flex justify-between">
                          <span>Precipitation:</span>
                          <span className="text-text-primary">{predictionResult.weather_data.precipitation_sum.toFixed(1)} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temperature:</span>
                          <span className="text-text-primary">{predictionResult.weather_data.temperature_mean.toFixed(1)}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wind Speed:</span>
                          <span className="text-text-primary">{predictionResult.weather_data.windspeed_max.toFixed(1)} m/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>7-day Rainfall:</span>
                          <span className="text-text-primary">{predictionResult.weather_data.precipitation_cumsum_7day.toFixed(1)} mm</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-text-muted py-12">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Enter location and date, then click "Predict Flood Risk" to see results</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      {predictionResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contributing Factors (Dynamic) */}
          {factorsData.length > 0 && (
            <ChartContainer title="Dynamic Risk Factors Breakdown">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={factorsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis 
                    type="number" 
                    stroke={chartTextColor}
                    tick={{ fill: chartTextColor, fontSize: 11 }}
                    domain={[0, 100]} 
                  />
                  <YAxis 
                    dataKey="factor" 
                    type="category" 
                    stroke={chartTextColor}
                    tick={{ fill: chartTextColor, fontSize: 11 }}
                    width={140} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: chartTooltipBg, 
                      border: `1px solid ${chartTooltipBorder}`, 
                      borderRadius: '8px' 
                    }}
                    labelStyle={{ color: chartTooltipText }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#F59E0B" name="Impact Score" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}

          {/* Historical Comparison */}
          {floodHistory?.major_events && floodHistory.major_events.length > 0 && (
            <ChartContainer title="Historical Flood Events (Deaths)">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={floodHistory.major_events}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                  <XAxis 
                    dataKey="year" 
                    stroke={chartTextColor}
                    tick={{ fill: chartTextColor, fontSize: 11 }}
                  />
                  <YAxis 
                    stroke={chartTextColor}
                    tick={{ fill: chartTextColor, fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: chartTooltipBg, 
                      border: `1px solid ${chartTooltipBorder}`, 
                      borderRadius: '8px' 
                    }}
                    labelStyle={{ color: chartTooltipText }}
                  />
                  <Legend />
                  <Line type="step" dataKey="deaths" stroke="#10B981" strokeWidth={2} name="Recorded Deaths" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      )}

      {/* Static Filler Content Section */}
      <div className="space-y-6 pt-8 border-t border-border-color mt-8">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Regional Analysis & Guidelines</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seasonal Flood Trends */}
          <ChartContainer title="Seasonal Flood Risk Trends">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={[
                { month: 'Jan', risk: 10 }, { month: 'Feb', risk: 15 },
                { month: 'Mar', risk: 25 }, { month: 'Apr', risk: 30 },
                { month: 'May', risk: 25 }, { month: 'Jun', risk: 45 },
                { month: 'Jul', risk: 85 }, { month: 'Aug', risk: 95 },
                { month: 'Sep', risk: 65 }, { month: 'Oct', risk: 25 },
                { month: 'Nov', risk: 15 }, { month: 'Dec', risk: 10 },
              ]}>
                <defs>
                  <linearGradient id="colorFloodRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke={chartTextColor}
                  tick={{ fill: chartTextColor, fontSize: 11 }}
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke={chartTextColor}
                  tick={{ fill: chartTextColor, fontSize: 11 }}
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: chartTooltipBg, 
                    border: `1px solid ${chartTooltipBorder}`, 
                    borderRadius: '8px' 
                  }}
                  labelStyle={{ color: chartTooltipText }}
                />
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorFloodRisk)"
                  name="Risk Level"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Contributing Risk Factors (Horizontal Bar Chart) */}
          <ChartContainer title="Primary Flood Drivers">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { factor: 'Monsoon Rain', value: 90 },
                { factor: 'Glacial Melt', value: 75 },
                { factor: 'River Overflow', value: 65 },
                { factor: 'Urban Drainage', value: 50 },
                { factor: 'Deforestation', value: 40 },
              ]} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke={chartTextColor}
                  tick={{ fill: chartTextColor, fontSize: 11 }}
                  hide 
                />
                <YAxis 
                  dataKey="factor" 
                  type="category" 
                  stroke={chartTextColor}
                  tick={{ fill: chartTextColor, fontSize: 12 }} 
                  width={100} 
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: chartTooltipBg, 
                    border: `1px solid ${chartTooltipBorder}`, 
                    borderRadius: '8px' 
                  }}
                  labelStyle={{ color: chartTooltipText }}
                />
                <Bar dataKey="value" fill="#60A5FA" radius={[0, 4, 4, 0]} barSize={20}>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High Risk Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background-light/50 backdrop-blur-md rounded-xl p-6 border border-border-color shadow-lg"
          >
            <h3 className="text-xl font-bold font-heading text-text-primary mb-4">High Vulnerability Zones</h3>
            <div className="space-y-3">
              {[
                { name: 'Khyber Pakhtunkhwa', districts: 14, risk: 'High', color: 'text-risk-critical border-risk-critical/20 bg-risk-critical/10' },
                { name: 'Sindh (Southern)', districts: 11, risk: 'High', color: 'text-risk-critical border-risk-critical/20 bg-risk-critical/10' },
                { name: 'Punjab (Riverine)', districts: 18, risk: 'Medium', color: 'text-risk-high border-risk-high/20 bg-risk-high/10' },
                { name: 'Balochistan', districts: 9, risk: 'Medium', color: 'text-risk-high border-risk-high/20 bg-risk-high/10' }
              ].map((area, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border-color hover:border-primary/30 transition-colors">
                  <div>
                    <div className="font-semibold text-text-primary">{area.name}</div>
                    <div className="text-xs text-text-secondary">Impacted Districts: {area.districts}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${area.color}`}>
                    {area.risk} Risk
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Prevention Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background-light/50 backdrop-blur-md rounded-xl p-6 border border-border-color shadow-lg"
          >
            <h3 className="text-xl font-bold font-heading text-text-primary mb-4">Flood Safety Guidelines</h3>
            <div className="space-y-4">
              {[
                { title: 'Emergency Kit', desc: 'Prepare food, water, and medical supplies for 72 hours.', icon: <span className="text-emerald-400">🛡️</span>, color: 'emerald' },
                { title: 'Secure Property', desc: 'Elevate furniture and install sandbags at entry points.', icon: <span className="text-blue-400">🏠</span>, color: 'blue' },
                { title: 'Evacuation Plan', desc: 'Identify higher ground and safe routes in your district.', icon: <span className="text-orange-400">🗺️</span>, color: 'orange' }
              ].map((tip, index) => (
                <div key={index} className="flex gap-4 p-4 bg-background/50 rounded-lg border border-border-color hover:border-primary/30 transition-colors group">
                  <div className={`flex-shrink-0 mt-1 p-2 rounded-lg bg-${tip.color}-500/10 group-hover:bg-${tip.color}-500/20 transition-colors`}>
                    {tip.icon}
                  </div>
                  <div>
                    <h4 className="font-bold font-heading text-text-primary mb-1 group-hover:text-primary transition-colors">{tip.title}</h4>
                    <p className="text-sm text-text-secondary font-body">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FloodPrediction;
