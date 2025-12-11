import { Line, Bar } from "react-chartjs-2";
import { useEffect, useMemo, useState } from "react";
import "./Charts.css";
import { ensureChartJSRegistered } from "../../lib/chartjs-setup";

// Ensure Chart.js components are registered once for the app
ensureChartJSRegistered();

function Charts({ weatherData }) {
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "light"
  );

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          setTheme(
            document.documentElement.getAttribute("data-theme") || "light"
          );
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const isDark = theme === "dark";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark
    ? "rgba(148, 163, 184, 0.15)"
    : "rgba(148, 163, 184, 0.1)";
  const legendColor = isDark ? "#cbd5e1" : "#64748b";

  const hourly = weatherData?.hourly;

  const labels = useMemo(() => {
    if (!hourly?.time) return [];
    return hourly.time.slice(0, 24).map((t) =>
      new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [hourly]);

  const tempData = useMemo(() => {
    if (!hourly?.temperature_2m) return null;
    return {
      labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: hourly.temperature_2m.slice(0, 24),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.15)",
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    };
  }, [hourly, labels]);

  const precipData = useMemo(() => {
    if (!hourly?.precipitation || !hourly?.rain) return null;
    return {
      labels,
      datasets: [
        {
          label: "Precipitation (mm)",
          data: hourly.precipitation.slice(0, 24),
          backgroundColor: "rgba(37,99,235,0.6)",
          borderColor: "#2563eb",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Rain (mm)",
          data: hourly.rain.slice(0, 24),
          backgroundColor: "rgba(59,130,246,0.35)",
          borderColor: "#3b82f6",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [hourly, labels]);

  const windHumData = useMemo(() => {
    if (!hourly?.wind_speed_10m || !hourly?.relative_humidity_2m) return null;
    return {
      labels,
      datasets: [
        {
          type: "line",
          label: "Wind Speed (m/s)",
          yAxisID: "y",
          data: hourly.wind_speed_10m.slice(0, 24),
          borderColor: "#10b981",
          backgroundColor: "rgba(16,185,129,0.15)",
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          type: "line",
          label: "Humidity (%)",
          yAxisID: "y1",
          data: hourly.relative_humidity_2m.slice(0, 24),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245,158,11,0.12)",
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    };
  }, [hourly, labels]);

  const commonLineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: legendColor,
            font: { size: 12, weight: "600" },
            usePointStyle: true,
            padding: 15,
          },
        },
        tooltip: {
          backgroundColor: isDark
            ? "rgba(15,23,42,0.98)"
            : "rgba(15,23,42,0.95)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#2563eb",
          borderWidth: 1,
          padding: 12,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: gridColor, drawBorder: false },
          ticks: { color: textColor, font: { size: 11 } },
        },
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { size: 11 } },
        },
      },
    }),
    [isDark, legendColor, gridColor, textColor]
  );

  const dualAxisOptions = useMemo(
    () => ({
      ...commonLineOptions,
      scales: {
        x: commonLineOptions.scales.x,
        y: {
          beginAtZero: true,
          grid: { color: gridColor, drawBorder: false },
          ticks: { color: textColor },
        },
        y1: {
          beginAtZero: true,
          position: "right",
          grid: { drawOnChartArea: false },
          ticks: { color: textColor },
        },
      },
    }),
    [commonLineOptions, gridColor, textColor]
  );

  const precipOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: commonLineOptions.plugins,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: gridColor, drawBorder: false },
          ticks: { color: textColor, font: { size: 11 } },
        },
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { size: 11 } },
        },
      },
    }),
    [commonLineOptions, gridColor, textColor]
  );

  if (!hourly) {
    return (
      <div className="dummy-charts-container">
        <div className="chart-wrapper">
          <div className="chart-header">
            <h3 className="chart-title">Click on the map</h3>
            <p className="chart-subtitle">
              Select a point to load weather charts
            </p>
          </div>
          <div
            className="chart-canvas"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#64748b" }}>No data yet</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dummy-charts-container">
      <div className="chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">
            Temperature <br /> <span> (next 24h)</span>
          </h3>
        </div>
        <div className="chart-canvas">
          <Line data={tempData} options={commonLineOptions} />
        </div>
      </div>

      <div className="chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">
            Precipitation & Rain <br /> <span> (next 24h)</span>
          </h3>
        </div>
        <div className="chart-canvas">
          <Bar data={precipData} options={precipOptions} />
        </div>
      </div>

      <div className="chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">
            Wind Speed & Humidity <br /> <span> (next 24h)</span>
          </h3>
        </div>
        <div className="chart-canvas">
          <Line data={windHumData} options={dualAxisOptions} />
        </div>
      </div>
    </div>
  );
}

export default Charts;
