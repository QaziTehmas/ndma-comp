import React, { useState, useRef, useEffect } from 'react';
import {
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
import { ChartContainer, RiskMeter } from '../../components/UI';
import { useMultipleData } from '../../hooks/useData';
import { loadFloodHistory, loadNDMAData } from '../../services/dataLoader';
import { predictFlood } from '../../services/floodPredictionService';
import { searchLocation } from '../../services/geocodingService';
import { searchCities } from '../../services/weatherService';
import { Droplets, AlertTriangle, Map, TrendingUp, Calendar, Globe, Search, Loader2 } from 'lucide-react';

const FloodPrediction = () => {
  const [predictionResult, setPredictionResult] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      setError('Please select a location from the suggestions');
      return;
    }

    // Validate date is not in the future
    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      setError('Cannot predict for future dates. Historical weather data is only available for past dates. Please select a date today or earlier.');
      return;
    }

    // Validate date is not too old (Open-Meteo typically has data from 1940)
    const earliestDate = new Date(1940, 0, 1);
    if (selectedDate < earliestDate) {
      setError('Historical weather data is only available from 1940 onwards. Please select a more recent date.');
      return;
    }

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
        <h1 className="text-3xl font-bold text-white mb-2">Flood Prediction System</h1>
        <p className="text-gray-400">AI-powered flood forecasting using historical weather data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2 bg-background-light rounded-lg p-6 border border-background-lighter">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Map className="w-6 h-6" />
            Prediction Parameters
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
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
                    onChange={(e) => {
                      const newYear = parseInt(e.target.value);
                      const maxYear = new Date().getFullYear();
                      if (newYear >= 1940 && newYear <= maxYear) {
                        setYear(e.target.value);
                      } else if (newYear > maxYear) {
                        setYear(maxYear);
                      } else if (newYear < 1940 && e.target.value.length > 0) {
                        setYear(1940);
                      }
                    }}
                    min="1940"
                    max={new Date().getFullYear()}
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
                      // Reset day if it exceeds days in new month
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
              disabled={loading || !selectedLocation}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Fetching Weather Data & Predicting...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Predict Flood Risk
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Results Display */}
        <div className="bg-background-light rounded-lg p-6 border border-background-lighter">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Prediction Results</h3>
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
                <div className="bg-background p-4 rounded-lg border border-background-lighter">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">Prediction</span>
                    <span className={`text-lg font-bold ${
                      predictionResult.flood_prediction === 1 
                        ? 'text-risk-critical' 
                        : 'text-green-500'
                    }`}>
                      {predictionResult.prediction_label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Probability</span>
                    <span className="text-white font-bold">{predictionResult.probability_percentage}%</span>
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
                      <div className="text-sm text-gray-400 mb-2">Date</div>
                      <div className="text-white font-semibold">
                        {predictionResult.weather_data.year}-{String(predictionResult.weather_data.month).padStart(2, '0')}-{String(predictionResult.weather_data.day).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="bg-background p-4 rounded-lg border border-background-lighter">
                      <div className="text-sm text-gray-400 mb-2">Weather Summary</div>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div className="flex justify-between">
                          <span>Precipitation:</span>
                          <span className="text-white">{predictionResult.weather_data.precipitation_sum.toFixed(1)} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temperature:</span>
                          <span className="text-white">{predictionResult.weather_data.temperature_mean.toFixed(1)}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wind Speed:</span>
                          <span className="text-white">{predictionResult.weather_data.windspeed_max.toFixed(1)} m/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span>7-day Rainfall:</span>
                          <span className="text-white">{predictionResult.weather_data.precipitation_cumsum_7day.toFixed(1)} mm</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Enter location and date, then click "Predict Flood Risk" to see results</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      {predictionResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contributing Factors */}
          {factorsData.length > 0 && (
            <ChartContainer title="Contributing Risk Factors">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={factorsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} />
                  <YAxis dataKey="factor" type="category" stroke="#94a3b8" width={140} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Line type="step" dataKey="deaths" stroke="#10B981" strokeWidth={2} name="Recorded Deaths" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default FloodPrediction;
