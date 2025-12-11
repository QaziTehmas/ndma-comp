import React from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Thermometer, CloudSnow, CloudDrizzle, AlertTriangle } from 'lucide-react';
import { getWeatherCondition } from '../../services/weatherService';

/**
 * Get weather icon based on weather code
 */
function getWeatherIcon(weatherCode) {
  if (weatherCode === 0 || weatherCode === 1) return <Sun className="w-6 h-6" />;
  if (weatherCode === 2) return <Cloud className="w-6 h-6" />;
  if (weatherCode === 3) return <Cloud className="w-6 h-6" />;
  if (weatherCode >= 51 && weatherCode <= 55) return <CloudDrizzle className="w-6 h-6" />;
  if (weatherCode >= 61 && weatherCode <= 65) return <CloudRain className="w-6 h-6" />;
  if (weatherCode >= 71 && weatherCode <= 86) return <CloudSnow className="w-6 h-6" />;
  if (weatherCode >= 95) return <CloudRain className="w-6 h-6" />;
  return <Cloud className="w-6 h-6" />;
}

/**
 * Get color based on earthquake risk level
 */
function getEarthquakeColor(riskLevel) {
  switch (riskLevel) {
    case 'high': return 'text-red-500 bg-red-500/10 border-red-500';
    case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500';
    case 'low': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
    default: return 'text-green-500 bg-green-500/10 border-green-500';
  }
}

const WeatherCard = ({ city, weather, earthquakeSummary, loading, error, onClick }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 text-white animate-pulse">
        <div className="h-6 bg-blue-500/20 rounded w-2/3 mb-4"></div>
        <div className="h-10 bg-blue-500/20 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-blue-500/20 rounded w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-4 text-white">
        <h3 className="font-bold mb-2">{city}</h3>
        <p className="text-sm text-red-300">Failed to load weather data</p>
      </div>
    );
  }

  if (!weather || !weather.current) {
    return null;
  }

  const { current } = weather;
  const weatherCondition = getWeatherCondition(current.weatherCode);
  const weatherIcon = getWeatherIcon(current.weatherCode);
  const hasEarthquakes = earthquakeSummary && earthquakeSummary.count > 0;

  return (
    <div
      className={`bg-gradient-to-br from-blue-600/40 to-blue-700/40 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
        onClick ? 'cursor-pointer hover:border-blue-400/50' : ''
      }`}
      onClick={onClick}
    >
      {/* Header with City Name and Icon */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">{city}</h3>
        <div className="text-blue-200">{weatherIcon}</div>
      </div>

      {/* Temperature */}
      <div className="text-4xl font-bold mb-2">
        {current.temperature ? `${Math.round(current.temperature)}°C` : 'N/A'}
      </div>

      {/* Weather Condition */}
      <div className="text-sm opacity-90 mb-3">{weatherCondition}</div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs opacity-80 mb-3">
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          <span>{current.humidity ? `${current.humidity}%` : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3" />
          <span>{current.windSpeed ? `${Math.round(current.windSpeed)} km/h` : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1">
          <CloudRain className="w-3 h-3" />
          <span>{current.precipitation !== null ? `${current.precipitation} mm` : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer className="w-3 h-3" />
          <span>{current.pressure ? `${Math.round(current.pressure)} hPa` : 'N/A'}</span>
        </div>
      </div>

      {/* Earthquake Indicator */}
      {hasEarthquakes && (
        <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded border ${getEarthquakeColor(earthquakeSummary.riskLevel)}`}>
          <AlertTriangle className="w-3 h-3" />
          <span>
            {earthquakeSummary.count} earthquake{earthquakeSummary.count > 1 ? 's' : ''} nearby
            {earthquakeSummary.maxMagnitude && ` (M${earthquakeSummary.maxMagnitude.toFixed(1)})`}
          </span>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
