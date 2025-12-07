import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { fetchWeatherForLocation } from '../services/weatherService';

const DownloadReportButton = ({
    selectedLocation = null,
    weatherData = null,
    seismicData = null,
    airQuality = null
}) => {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);

        try {
            console.log('Starting PDF generation...');

            // 1. Fetch flood data from backend (Independent of location)
            const floodResponse = await fetch('http://localhost:8000/api/flood-data');
            if (!floodResponse.ok) throw new Error('Failed to fetch flood data');
            const floodData = await floodResponse.json();

            // 2. Prepare Weather Data
            let finalWeatherData = weatherData;

            // If no weather data passed, fallback to selected location or Islamabad
            if (!finalWeatherData) {
                console.log('No weather data provided, fetching...');
                const targetLat = selectedLocation?.latitude || 33.6844;
                const targetLon = selectedLocation?.longitude || 73.0479;
                try {
                    finalWeatherData = await fetchWeatherForLocation(targetLat, targetLon);
                    // Append location name if available
                    if (finalWeatherData && selectedLocation?.name) {
                        finalWeatherData.locationName = selectedLocation.name;
                    }
                } catch (wError) {
                    console.warn('Weather data fetch failed:', wError);
                }
            } else if (selectedLocation?.name) {
                // Ensure name is attached if data came from props
                finalWeatherData.locationName = selectedLocation.name;
            }

            // 3. Import generator dynamically
            const { generateComprehensiveReport } = await import('../utils/pdfGenerator');

            // 4. Generate PDF with all context
            // Passing seismicData as the 3rd argument, airQuality as 4th
            const doc = await generateComprehensiveReport(floodData, finalWeatherData, seismicData, airQuality);

            // 5. Download
            const pdfBlob = doc.output('blob');
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            const filename = `NDMA_Alert_Report_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '_')}.pdf`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('PDF downloaded successfully!');

        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please check the console for details.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={downloading}
            className="fixed bottom-8 right-8 z-50 group"
            title="Download Alert Report"
        >
            <div className="relative">
                <div className={`
                    flex items-center gap-3 px-6 py-4 rounded-2xl
                    bg-gradient-to-r from-blue-600 to-blue-700
                    hover:from-blue-700 hover:to-blue-800
                    text-white font-bold shadow-2xl
                    transition-all duration-300
                    ${downloading ? 'opacity-70 cursor-wait' : 'hover:scale-105 hover:shadow-blue-500/50'}
                `}>
                    {downloading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <FileDown className="w-6 h-6" />
                    )}
                    <span className="hidden sm:inline">
                        {downloading ? 'Generating...' : 'Download Report'}
                    </span>
                </div>

                {!downloading && (
                    <div className="absolute inset-0 rounded-2xl bg-blue-500 opacity-75 animate-ping" />
                )}

                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none sm:hidden">
                    Download Alert Report
                </div>
            </div>
        </button>
    );
};

export default DownloadReportButton;
