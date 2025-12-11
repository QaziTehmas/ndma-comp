import React from 'react';
import { MapPin, Thermometer, Droplets, Wind, CloudRain, Activity, RefreshCw, AlertTriangle, Clock } from 'lucide-react';

/**
 * Right sidebar component - Modern design with bold colored cards
 */
const WeatherDetailsPanel = ({
    selectedLocation,
    weatherData,
    earthquakeSummary,
    loading,
    onRefresh
}) => {
    if (loading && !weatherData) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
                <div className="p-6 animate-pulse space-y-4">
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                    <div className="h-32 bg-gray-200 rounded-xl"></div>
                    <div className="h-24 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!weatherData) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center p-6">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm font-medium">Select a location on the map</p>
                    <p className="text-gray-400 text-xs mt-2">to view detailed weather information</p>
                </div>
            </div>
        );
    }

    const { current } = weatherData;

    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
            {/* Header with Location */}
            <div className="p-5 bg-white border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-blue-600 text-xs font-bold mb-2 uppercase tracking-wide">
                            <MapPin className="w-4 h-4" />
                            Weather & Earthquakes Details
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedLocation.name}</h2>
                        <p className="text-sm text-gray-500">
                            {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E
                        </p>
                    </div>
                    <button
                        onClick={onRefresh}
                        className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all"
                        disabled={loading}
                        title="Refresh weather data"
                    >
                        <RefreshCw className={`w-4 h-4 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Current Time Card */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold mb-2">
                        <Clock className="w-3.5 h-3.5" />
                        SELECTED LOCATION TIME
                    </div>
                    <div className="text-3xl font-bold">
                        {new Date().toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </div>
                </div>

                {/* Temperature Card - Large & Bold */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold mb-3">
                        <Thermometer className="w-4 h-4" />
                        TEMPERATURE
                    </div>
                    <div className="text-5xl font-bold mb-2">{current.temperature}°C</div>
                    {current.weatherDescription && (
                        <p className="text-blue-100 text-sm capitalize">{current.weatherDescription}</p>
                    )}
                </div>

                {/* Precipitation Card */}
                {current.precipitation !== undefined && (
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-lg">
                        <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold mb-2">
                            <CloudRain className="w-3.5 h-3.5" />
                            PRECIPITATION
                        </div>
                        <div className="text-4xl font-bold">{current.precipitation} mm</div>
                    </div>
                )}

                {/* Wind Speed Card */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold mb-2">
                        <Wind className="w-3.5 h-3.5" />
                        WIND SPEED
                    </div>
                    <div className="text-4xl font-bold">{current.windSpeed} m/s</div>
                </div>

                {/* Rainfall Card */}
                {current.rain !== undefined && (
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-lg">
                        <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold mb-2">
                            <Droplets className="w-3.5 h-3.5" />
                            RAINFALL
                        </div>
                        <div className="text-4xl font-bold">{current.rain || 0} mm</div>
                    </div>
                )}

                {/* Earthquake Card */}
                {earthquakeSummary && earthquakeSummary.count > 0 ? (
                    <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 text-white shadow-lg">
                        <div className="flex items-center gap-2 text-red-100 text-xs font-semibold mb-2">
                            <Activity className="w-4 h-4" />
                            EARTHQUAKE NEARBY
                        </div>
                        <div className="text-4xl font-bold mb-1">M {earthquakeSummary.mostRecent?.magnitude.toFixed(1)}</div>
                        {earthquakeSummary.mostRecent && (
                            <div className="text-red-100 text-sm space-y-1">
                                <div className="font-medium">{earthquakeSummary.mostRecent.distance} km away</div>
                                <div className="text-xs opacity-90">
                                    {earthquakeSummary.mostRecent.place.length > 45
                                        ? earthquakeSummary.mostRecent.place.substring(0, 45) + '...'
                                        : earthquakeSummary.mostRecent.place
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white shadow-lg text-center">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-80" />
                        <p className="text-sm font-semibold">No Seismic Activity</p>
                        <p className="text-xs text-green-100 mt-1 opacity-90">
                            No earthquakes in the last 30 days
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeatherDetailsPanel;
