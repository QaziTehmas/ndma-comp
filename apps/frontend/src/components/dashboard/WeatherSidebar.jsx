import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Thermometer, Droplets, Wind, CloudRain, Activity, AlertTriangle, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { fetchMultipleCities, searchCities } from '../../services/weatherService';

/**
 * Helper function to get relative time
 */
const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
};

/**
 * Helper to get AQI gradient colors
 */
const getAQIStyles = (color) => {
    const styles = {
        green: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        yellow: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        orange: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
        red: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
        purple: { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        maroon: { color: 'text-rose-900', bg: 'bg-rose-900/10', border: 'border-rose-900/20' }
    };
    return styles[color] || { color: 'text-text-muted', bg: 'bg-background-light/50', border: 'border-border-color' };
};

/**
 * Animated Number Component
 */
const AnimatedNumber = ({ value, decimals = 0, suffix = '', prefix = '' }) => {
    const [prevValue, setPrevValue] = useState(value);

    useEffect(() => {
        if (value !== prevValue) {
            setPrevValue(value);
        }
    }, [value, prevValue]);

    return (
        <CountUp
            start={prevValue}
            end={value}
            duration={1.2}
            decimals={decimals}
            suffix={suffix}
            prefix={prefix}
            useEasing={true}
            easingFn={(t, b, c, d) => {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            }}
        />
    );
};

/**
 * Compact metric card with premium glassmorphism
 */
const MetricCard = ({ icon: Icon, label, value, sublabel, color, delay, numericValue, tooltip }) => {
    // Map colors to stronger glass variants for better visibility
    const colorMap = {
        orange: 'group-hover:border-orange-500/50 text-orange-400 bg-orange-600/20 border-orange-500/10',
        blue: 'group-hover:border-blue-500/50 text-blue-400 bg-blue-600/20 border-blue-500/10',
        cyan: 'group-hover:border-cyan-500/50 text-cyan-400 bg-cyan-600/20 border-cyan-500/10',
        purple: 'group-hover:border-purple-500/50 text-purple-400 bg-purple-600/20 border-purple-500/10',
    };

    // Default to gray if undefined
    const accentClass = colorMap[color] || 'group-hover:border-primary/50 text-text-secondary bg-background-light/50 border-border-color';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: delay }}
            whileHover={{ scale: 1.02 }}
            className={`rounded-2xl p-4 backdrop-blur-md border shadow-lg relative overflow-hidden group cursor-default transition-all duration-300 ${accentClass}`}
            title={tooltip}
        >
            {/* Decorative background blob */}
            <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity duration-500 group-hover:opacity-30 ${accentClass.split(' ')[1]?.replace('text-', 'bg-') || 'bg-primary'}`}></div>

            <div className="flex flex-col justify-between h-full relative z-10 gap-3">
                <div className="flex justify-between items-start">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-text-secondary">{label}</span>
                    <Icon className={`w-5 h-5 opacity-80 ${accentClass.split(' ')[1]}`} />
                </div>

                <div>
                    <div className="text-2xl font-black text-text-primary tracking-tight flex items-baseline gap-1">
                        <AnimatedNumber value={numericValue} suffix={value.replace(/[0-9.]/g, '')} />
                    </div>
                    <span className="text-[10px] text-text-muted font-medium block mt-1">{sublabel}</span>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Weather Sidebar with all fixes
 */
const WeatherSidebar = ({
    selectedLocation,
    weatherData,
    citiesWeather,
    earthquakeSummary,
    airQuality,
    riskSummary,
    onLocationSelect,
    loading
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (weatherData && isInitialLoad) {
            setIsInitialLoad(false);
        }
    }, [weatherData, isInitialLoad]);

    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceTimeout = useRef(null);

    // Debounced search effect
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        setIsSearching(true);
        debounceTimeout.current = setTimeout(async () => {
            try {
                const results = await searchCities(searchQuery);
                setSearchResults(results);
                setShowDropdown(true);
            } catch (error) {
                console.error("Search failed:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(debounceTimeout.current);
    }, [searchQuery]);

    // Use search results for the list (Limit to top 5)
    const filteredCities = searchResults.length > 0 ? searchResults.slice(0, 5) : [];

    // Handle city selection
    const handleCitySelect = (city) => {
        if (onLocationSelect && city.latitude && city.longitude) {
            onLocationSelect(city.latitude, city.longitude, city.name);
            setSearchQuery('');
            setShowDropdown(false);
            setSelectedIndex(0);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!showDropdown || filteredCities.length === 0) {
            if (e.key === 'Enter' && searchQuery && filteredCities.length > 0) {
                handleCitySelect(filteredCities[0]);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredCities.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCities[selectedIndex]) {
                    handleCitySelect(filteredCities[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSearchQuery('');
                break;
            default:
                break;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    // Default cities for "Featured" list
    const DEFAULT_CITIES = [
        { name: "Islamabad", latitude: 33.6844, longitude: 73.0479, region: "Capital", country: "Pakistan" },
        { name: "Karachi", latitude: 24.8607, longitude: 67.0011, region: "Sindh", country: "Pakistan" },
        { name: "Lahore", latitude: 31.5204, longitude: 74.3587, region: "Punjab", country: "Pakistan" },
        { name: "Peshawar", latitude: 34.0151, longitude: 71.5249, region: "KPK", country: "Pakistan" },
        { name: "Quetta", latitude: 30.1798, longitude: 66.9750, region: "Balochistan", country: "Pakistan" }
    ];

    const [featuredCities, setFeaturedCities] = useState([]);

    // Fetch featured cities weather on mount
    useEffect(() => {
        const loadFeaturedCities = async () => {
            try {
                const enriched = await fetchMultipleCities(DEFAULT_CITIES);
                setFeaturedCities(enriched);
            } catch (err) {
                console.error("Failed to load featured cities", err);
            }
        };
        loadFeaturedCities();
    }, []);

    // ... existing search logic ...

    return (
        <div className="h-full flex flex-col bg-background-secondary border-r border-border-color shadow-2xl relative z-20">
            {/* Search with Autocomplete */}
            <div className="p-4 border-b border-border-color bg-background-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-background-secondary/60 sticky top-0 z-10">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                >
                    {isSearching ? (
                        <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                    ) : (
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    )}
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search global cities..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        className="w-full pl-10 pr-10 py-2 bg-background border border-border-color rounded-xl text-text-primary placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-inner"
                    />
                    {searchQuery && !isSearching && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setShowDropdown(false);
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1 rounded-full hover:bg-background-light"
                            title="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    {/* Autocomplete Dropdown */}
                    {showDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-background border border-border-color rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto custom-scrollbar"
                        >
                            {isSearching ? (
                                <div className="px-4 py-3 text-center text-text-secondary text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                                    Searching...
                                </div>
                            ) : filteredCities.length > 0 ? (
                                <div>
                                    <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-background-light/50 border-b border-border-color">
                                        Search Results
                                    </div>
                                    {filteredCities.map((city, index) => (
                                        <button
                                            key={`${city.name}-${index}`}
                                            onClick={() => handleCitySelect(city)}
                                            className={`w-full px-4 py-3 text-left transition-colors ${index === selectedIndex
                                                ? 'bg-primary text-text-primary'
                                                : 'bg-background text-text-secondary hover:bg-background-light'
                                                } ${index !== filteredCities.length - 1 ? 'border-b border-border-color' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-medium text-text-primary">{city.name}</span>
                                                    <span className="text-xs ml-2 opacity-50 block text-text-muted">
                                                        {city.region}, {city.country}
                                                    </span>
                                                </div>
                                                <MapPin className="w-3 h-3 opacity-50 text-text-muted" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-6 text-center text-text-secondary text-sm">
                                    {searchQuery.length < 2 ? 'Type to search cities...' : 'No matching cities found'}
                                </div>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 space-y-4">
                    {/* Current Location Info */}
                    {selectedLocation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-4"
                        >
                            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold mb-1 uppercase tracking-wider">
                                <MapPin className="w-3 h-3" />
                                Monitoring Location
                            </div>
                            <h2 className="text-xl font-bold text-text-primary leading-tight">{selectedLocation.name}</h2>
                            <div className="text-text-muted text-[10px] mt-0.5 font-mono">
                                {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E
                            </div>
                            <p className="text-[10px] text-text-secondary mt-1">Real-time weather and disaster data for this location</p>
                        </motion.div>
                    )}

                    {/* Current Weather Conditions */}
                    {weatherData && (
                        <div className="space-y-2">
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></div>
                                    Current Weather
                                </div>
                                <p className="text-[10px] text-text-secondary">Live conditions updated every 5 minutes</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <MetricCard
                                    icon={Thermometer}
                                    label="Temperature"
                                    value={`${weatherData.current.temperature}°C`}
                                    numericValue={weatherData.current.temperature}
                                    sublabel="Air temp"
                                    color="orange"
                                    delay={0.1}
                                    tooltip="Current air temperature"
                                />
                                <MetricCard
                                    icon={Droplets}
                                    label="Humidity"
                                    value={`${weatherData.current.humidity}%`}
                                    numericValue={weatherData.current.humidity}
                                    sublabel="Moisture"
                                    color="blue"
                                    delay={0.2}
                                    tooltip="Relative humidity"
                                />
                                <MetricCard
                                    icon={Wind}
                                    label="Wind"
                                    value={`${weatherData.current.windSpeed} km/h`}
                                    numericValue={weatherData.current.windSpeed}
                                    sublabel="Surface"
                                    color="cyan"
                                    delay={0.3}
                                    tooltip="Wind speed"
                                />
                                <MetricCard
                                    icon={CloudRain}
                                    label="Rain"
                                    value={`${weatherData.current.precipitation || 0} mm`}
                                    numericValue={weatherData.current.precipitation || 0}
                                    sublabel="Volume"
                                    color="purple"
                                    delay={0.4}
                                    tooltip="Rainfall amount"
                                />
                            </div>
                        </div>
                    )}

                    {/* Air Quality Alert */}
                    {airQuality && airQuality.aqi && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`${getAQIStyles(airQuality.category?.color).bg} backdrop-blur-md border ${getAQIStyles(airQuality.category?.color).border} rounded-xl p-4 shadow-lg relative overflow-hidden group cursor-default transition-colors duration-300`}
                            title="Air Quality Index"
                        >
                            <div className={`absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-3xl opacity-20 ${getAQIStyles(airQuality.category?.color).color.replace('text-', 'bg-')}`}></div>

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex-1">
                                    <div className={`text-[10px] font-bold ${getAQIStyles(airQuality.category?.color).color} mb-1 uppercase tracking-wider flex items-center gap-1.5`}>
                                        <Wind className="w-3 h-3" /> Air Quality
                                    </div>
                                    <div className="text-3xl font-extrabold text-text-primary mb-1">
                                        {airQuality.aqi}
                                    </div>
                                    <div className="text-sm font-bold text-text-secondary mb-0.5">
                                        {airQuality.category?.level || 'Unknown'}
                                    </div>
                                    <div className="text-[10px] text-text-muted">
                                        {airQuality.category?.description || 'Data unavailable'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Earthquake Alert */}
                    {earthquakeSummary && earthquakeSummary.count > 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-br from-red-900/50 to-red-600/20 border border-red-500/30 rounded-xl p-3 shadow-lg relative overflow-hidden group cursor-default"
                            title="Recent earthquake activity detected in your area"
                        >
                            <div className="absolute -right-2 -bottom-2 opacity-10">
                                <Activity className="w-20 h-20 text-red-500" />
                            </div>
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex-1">
                                    <div className="text-[10px] font-bold text-red-400 mb-0.5 uppercase tracking-wider flex items-center gap-1.5">
                                        Seismic Activity
                                    </div>
                                    <div className="text-2xl font-extrabold text-text-primary mb-0.5">
                                        M <AnimatedNumber value={earthquakeSummary.mostRecent?.magnitude || 0} decimals={1} />
                                    </div>
                                    <div className="text-[10px] text-red-200/70 font-medium">
                                        <AnimatedNumber value={earthquakeSummary.mostRecent?.distance || 0} decimals={0} suffix=" km away" />
                                    </div>
                                    {earthquakeSummary.mostRecent?.time && (
                                        <div className="text-[10px] text-red-200/60 mt-0.5">
                                            {getRelativeTime(earthquakeSummary.mostRecent.time)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-green-900/30 to-green-600/10 border border-green-500/20 rounded-xl p-3 shadow-lg"
                            title="No recent earthquake activity in your area"
                        >
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-500/20 rounded-lg">
                                    <Activity className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-green-400">No Seismic Activity</div>
                                    <div className="text-[10px] text-green-200/60">No earthquakes detected within 100km</div>
                                </div>
                            </div>
                        </motion.div>
                    )}


                    {/* Historical Risk Alert */}
                    {riskSummary && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gradient-to-br from-amber-900/40 to-amber-600/10 border border-amber-500/20 rounded-xl p-3 shadow-lg relative overflow-hidden mb-3"
                        >
                            <div className="flex items-start gap-2 relative z-10">
                                <div className="p-1.5 bg-amber-500/20 rounded-lg flex-shrink-0">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-bold text-amber-400 mb-1 uppercase tracking-wider">
                                        Historical Risk Analysis
                                    </div>
                                    <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/20">
                                        {riskSummary}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}



                    {/* Featured Cities List */}
                    <div className="pt-2 pb-2">
                        <div className="space-y-0.5 mb-3 px-1">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                Featured Cities
                            </div>
                            <p className="text-[10px] text-text-secondary">Quick access to major hubs</p>
                        </div>

                        <div className="space-y-2">
                            {featuredCities.length > 0 ? (
                                featuredCities.map((city, index) => (
                                    <motion.button
                                        key={`sidebar-featured-${city.name}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.02, x: 2 }}
                                        onClick={() => handleCitySelect(city)}
                                        className="w-full bg-background/40 hover:bg-background border border-border-color/50 hover:border-primary/50 rounded-xl p-3 text-left transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500"></div>

                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-background-light/50 flex items-center justify-center text-xs font-bold text-text-muted group-hover:text-primary group-hover:bg-primary/10 transition-colors shadow-inner">
                                                    {city.name.substring(0, 1)}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-text-secondary text-sm group-hover:text-text-primary transition-colors">{city.name}</span>
                                                    <span className="text-[10px] text-text-muted block">{city.region}</span>
                                                </div>
                                            </div>

                                            {city.weather && city.weather.current ? (
                                                <div className="text-right">
                                                    <span className="block font-black text-text-primary text-lg leading-none">{Math.round(city.weather.current.temperature)}°</span>
                                                    <span className="text-[10px] text-text-muted font-medium block mt-0.5">
                                                        {city.weather.current.weatherCode !== undefined ?
                                                            ['Clear', 'Cloudy', 'Rain', 'Snow'][Math.min(Math.floor(city.weather.current.weatherCode / 20), 3)] : 'Clear'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="animate-pulse w-8 h-4 bg-background-light rounded"></div>
                                            )}
                                        </div>
                                    </motion.button>
                                ))
                            ) : (
                                <div className="text-center py-8 text-text-secondary">
                                    <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin opacity-50" />
                                    <p className="text-xs">Loading cities...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherSidebar;
