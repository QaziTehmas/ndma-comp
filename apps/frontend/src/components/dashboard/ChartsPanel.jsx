import React from 'react';
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { TemperatureForecastChart, PrecipitationChart, HumidityWindChart } from './WeatherCharts';
import { motion, AnimatePresence } from 'framer-motion';
import DownloadReportButton from '../DownloadReportButton';

/**
 * Charts Panel - Premium dark themed, collapsible bottom panel with smooth animations
 */
const ChartsPanel = ({ weatherData, isOpen, onToggle, selectedLocation, seismicData, airQuality }) => {
    if (!weatherData || !weatherData.forecast24h || weatherData.forecast24h.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={false}
            animate={isOpen ? { y: 0 } : { y: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`
                ${isOpen ? 'absolute bottom-0 left-0 right-0 z-[1500] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-h-[85vh] rounded-3xl' : 'relative'}
                bg-gray-900/95 backdrop-blur-md border-t border-gray-800 flex flex-col rounded-2xl
            `}
        >
            {/* Toggle Header */}
            <div className="w-full px-6 py-4 flex items-center justify-between">
                <button
                    onClick={onToggle}
                    className="flex items-center gap-3 hover:bg-white/5 transition-colors group flex-1"
                >
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                        <span className="text-white font-bold block text-sm">
                            24-Hour Forecast Analysis
                        </span>
                        <span className="text-gray-500 text-xs font-medium">
                            Detailed breakdown of upcoming weather conditions
                        </span>
                    </div>
                </button>
                
                <div className="flex items-center gap-3">
                    {/* Download Report Button */}
                    {isOpen && <div className='mr-4'>
                        <DownloadReportButton
                            selectedLocation={selectedLocation}
                            weatherData={weatherData}
                            seismicData={seismicData}
                            airQuality={airQuality}
                        />
                    </div>}
                    
                    <span className="text-xs font-mono text-gray-500 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                        {weatherData.forecast24h.length} POINTS
                    </span>
                    
                    <button
                        onClick={onToggle}
                        className="hover:bg-white/5 p-1 rounded transition-colors"
                    >
                        {isOpen ? (
                            <ChevronDown className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                        ) : (
                            <ChevronUp className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                        )}
                    </button>
                </div>
            </div>

            {/* Charts Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden flex-1"
                    >
                        <div className="p-4 border-t border-gray-800 bg-gray-900/50 overflow-y-auto max-h-[60vh]">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Temperature Chart */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 hover:border-gray-600 transition-colors shadow-lg"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-white">Temperature Trend</h3>
                                            <p className="text-xs text-gray-400">Next 24 hours variation</p>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    </div>
                                    <TemperatureForecastChart forecast24h={weatherData.forecast24h} />
                                </motion.div>

                                {/* Precipitation Chart */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 hover:border-gray-600 transition-colors shadow-lg"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-white">Precipitation & Rain</h3>
                                            <p className="text-xs text-gray-400">Expected rainfall volume</p>
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    </div>
                                    <PrecipitationChart forecast24h={weatherData.forecast24h} />
                                </motion.div>

                                {/* Humidity & Wind Chart */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 hover:border-gray-600 transition-colors shadow-lg"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-white">Humidity & Wind</h3>
                                            <p className="text-xs text-gray-400">Combined atmospheric conditions</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        </div>
                                    </div>
                                    <HumidityWindChart forecast24h={weatherData.forecast24h} />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ChartsPanel;
