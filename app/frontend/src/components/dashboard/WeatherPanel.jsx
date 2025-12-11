import { useState } from "react";
import {
  Thermometer,
  Wind,
  Droplets,
  MapPin,
  Clock,
  Search,
  Activity,
} from "lucide-react";
import "./WeatherPanel.css";

function WeatherPanel({
  selectedPoint,
  weatherData,
  weatherLoading,
  weatherError,
  locationName,
  onSearch,
  earthquakeData,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !onSearch) return;

    setSearching(true);
    try {
      await onSearch(searchQuery);
      setSearchQuery(""); // Clear search after successful search
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };
  const hourly = weatherData?.hourly;
  const curIso = weatherData?.current_weather?.time;
  let idx = -1;
  if (hourly?.time) {
    idx = curIso ? hourly.time.indexOf(curIso) : -1;
    if (idx === -1) {
      const now = Date.now();
      let best = 0,
        bestDiff = Infinity;
      hourly.time.forEach((t, i) => {
        const d = Math.abs(new Date(t).getTime() - now);
        if (d < bestDiff) {
          best = i;
          bestDiff = d;
        }
      });
      idx = best;
    }
  }
  const tempNow =
    idx >= 0 && hourly?.temperature_2m
      ? Math.round(hourly.temperature_2m[idx])
      : null;
  const windNow =
    idx >= 0 && hourly?.wind_speed_10m
      ? Math.round(hourly.wind_speed_10m[idx])
      : null;
  const precNow =
    idx >= 0 && hourly?.precipitation ? hourly.precipitation[idx] ?? 0 : null;
  const rainNow = idx >= 0 && hourly?.rain ? hourly.rain[idx] ?? 0 : null;

  // Format time to 12-hour AM/PM - parse directly from API string to avoid timezone conversion
  const timeStr = idx >= 0 && hourly?.time ? hourly.time[idx] : null;
  let formattedTime = "—:— —";
  if (timeStr) {
    // Parse time directly from the ISO string (e.g., "2024-11-13T14:30")
    // without timezone conversion to show the selected location's time
    const timePart = timeStr.includes("T") ? timeStr.split("T")[1] : timeStr;
    const [hoursStr, minutesStr] = timePart.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const minutesPadded = minutes < 10 ? `0${minutes}` : minutes;
    formattedTime = `${hours}:${minutesPadded} ${ampm}`;
  }
  const tzAbbr = weatherData?.timezone_abbreviation || "";

  return (
    <div className="weather-panel">
      <h2 className="panel-title">Weather & Earthquakes Details</h2>
      <p className="panel-description">Location-Based Insights</p>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search city or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={searching}
          />
          {searching && <div className="search-spinner"></div>}
        </div>
      </form>

      {/* Location Section */}
      <div className="weather-section">
        <div className="location-header">
          <MapPin size={20} className="location-icon" />
          <div className="location-info">
            <h3 className="location-name">
              {locationName || "No location selected"}
            </h3>
            <p className="location-label">
              {selectedPoint
                ? `Lat: ${selectedPoint.latitude.toFixed(
                    4
                  )}, Lon: ${selectedPoint.longitude.toFixed(4)}`
                : "No location selected"}
            </p>
          </div>
        </div>
      </div>

      {/* Time Section */}
      {timeStr && (
        <div className="weather-section time-section">
          <Clock size={18} className="time-icon" />
          <div className="time-info">
            <h3 className="time-value">{formattedTime}</h3>
            <p className="time-label">
              Selected location time{tzAbbr ? ` (${tzAbbr})` : ""}
            </p>
          </div>
        </div>
      )}

      {/* Weather Metrics */}
      {weatherData && (
        <div className="weather-metrics">
          <div className="weather-card">
            <div className="weather-card-header">
              <Thermometer size={20} className="weather-icon" />
              <span className="weather-metric-label">Temperature</span>
            </div>
            <div className="weather-metric-value">
              {tempNow !== null ? `${tempNow}°C` : "N/A"}
            </div>
          </div>

          <div className="weather-card">
            <div className="weather-card-header">
              <Droplets size={20} className="weather-icon" />
              <span className="weather-metric-label">Precipitation</span>
            </div>
            <div className="weather-metric-value">
              {precNow !== null ? `${precNow} mm` : "N/A"}
            </div>
          </div>

          <div className="weather-card">
            <div className="weather-card-header">
              <Wind size={20} className="weather-icon" />
              <span className="weather-metric-label">Wind Speed</span>
            </div>
            <div className="weather-metric-value">
              {windNow !== null ? `${windNow} m/s` : "N/A"}
            </div>
          </div>

          <div className="weather-card">
            <div className="weather-card-header">
              <Droplets size={20} className="weather-icon" />
              <span className="weather-metric-label">Rainfall</span>
            </div>
            <div className="weather-metric-value">
              {rainNow !== null ? `${rainNow} mm` : "N/A"}
            </div>
          </div>

          {/* Earthquake Info */}
          {earthquakeData && (
            <div className="weather-card earthquake-card">
              <div className="weather-card-header">
                <Activity size={20} className="weather-icon" />
                <span className="weather-metric-label">Earthquake Nearby</span>
              </div>
              <div className="weather-metric-value">
                {earthquakeData.magnitude
                  ? `M ${earthquakeData.magnitude.toFixed(1)}`
                  : "N/A"}
              </div>
              <div className="earthquake-details">
                <p className="earthquake-info">
                  {earthquakeData.distance} km away
                </p>
                {earthquakeData.place && (
                  <p className="earthquake-place">{earthquakeData.place}</p>
                )}
              </div>
            </div>
          )}

          {!earthquakeData && (
            <div className="weather-card no-earthquake-card">
              <div className="weather-card-header">
                <Activity size={20} className="weather-icon" />
                <span className="weather-metric-label">Earthquake</span>
              </div>
              <div
                className="weather-metric-value"
                style={{ fontSize: "1.25rem" }}
              >
                No recent activity
              </div>
              <p className="earthquake-info">Within 100 km</p>
            </div>
          )}
        </div>
      )}

      {!weatherData && !weatherLoading && (
        <div className="no-weather-message">
          <p>Click on the map to view weather data</p>
        </div>
      )}

      {weatherLoading && (
        <div className="loading-message">
          <p>Loading weather data...</p>
        </div>
      )}

      {weatherError && (
        <div className="error-message">
          <p>{weatherError}</p>
        </div>
      )}
    </div>
  );
}

export default WeatherPanel;
