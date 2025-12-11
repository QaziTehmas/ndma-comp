import {
  BarChart3,
  AlertTriangle,
  Calendar,
  Clock,
  Download,
} from "lucide-react";
import "./InfoSidebar.css";
import { useEffect, useState } from "react";

import generatePdfReport from "../../utils/generateReportClean";
import { INFO_SIDEBAR_BASE_URL } from "../../config/api";

function InfoSidebar({
  selectedPoint,
  locationName,
  mapView,
  weatherData,
  nearestQuake,
}) {
  const [histStats, setHistStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [predError, setPredError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [openMeteoStatus, setOpenMeteoStatus] = useState("checking");
  const [weatheringStatus, setWeatheringStatus] = useState("checking");
  const [exporting, setExporting] = useState(false);

  // Fetch flood prediction when a point is selected
  useEffect(() => {
    const fetchPrediction = async () => {
      if (
        !selectedPoint ||
        selectedPoint.latitude == null ||
        selectedPoint.longitude == null
      ) {
        setPrediction(null);
        return;
      }
      setPredLoading(true);
      setPredError(null);
      try {
        const url = new URL(`${INFO_SIDEBAR_BASE_URL.onrender}api/predict`);
        url.searchParams.set("lat", String(selectedPoint.latitude));
        url.searchParams.set("lon", String(selectedPoint.longitude));
        const resp = await fetch(url.toString());
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        // API returns a top-level `risk_result` object (see example). Normalize
        // prediction to contain `risk_level`, `message` and optional `risk_score`.
        const rr = json?.risk_result || json?.riskResult || null;
        if (rr) {
          setPrediction({
            risk_level: rr.risk_level || rr.riskLevel || rr.level || null,
            message: rr.message || rr.msg || null,
            risk_score: rr.risk_score ?? rr.score ?? null,
          });
        } else {
          setPrediction(null);
        }
      } catch (e) {
        console.error("Prediction fetch failed:", e);
        setPrediction(null);
        setPredError("Failed to load prediction");
      } finally {
        setPredLoading(false);
      }
    };
    fetchPrediction();
  }, [selectedPoint]);

  // Risk badge class helper (replaces inline styles)
  const riskBadgeClass = (risk) => {
    const level = (risk || "").toLowerCase();
    if (level === "high") return "risk-high";
    if (level === "medium" || level === "moderate") return "risk-medium";
    if (level === "low") return "risk-low";
    return "risk-unknown";
  };

  // Quick availability checks for external services (run on mount)
  useEffect(() => {
    let abortOpen = new AbortController();
    let abortWeather = new AbortController();

    const timeout = (ms, signal) =>
      new Promise((_, rej) => {
        const id = setTimeout(() => rej(new Error("timeout")), ms);
        signal.addEventListener("abort", () => {
          clearTimeout(id);
          rej(new Error("aborted"));
        });
      });

    const checkOpenMeteo = async () => {
      try {
        const url =
          "https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current_weather=true";
        const resPromise = fetch(url, { signal: abortOpen.signal });
        const res = await Promise.race([
          resPromise,
          timeout(4000, abortOpen.signal),
        ]);
        if (res && res.ok) setOpenMeteoStatus("up");
        else setOpenMeteoStatus("down");
      } catch {
        setOpenMeteoStatus("down");
      }
    };

    const checkWeathering = async () => {
      try {
        // Try the prediction endpoint with dummy coords to detect if backend responds
        const url = "http://localhost:5000/api/predict?lat=0&lon=0";
        const resPromise = fetch(url, {
          method: "GET",
          signal: abortWeather.signal,
        });
        const res = await Promise.race([
          resPromise,
          timeout(4000, abortWeather.signal),
        ]);
        if (res && res.ok) setWeatheringStatus("up");
        else setWeatheringStatus("down");
      } catch {
        setWeatheringStatus("down");
      }
    };

    checkOpenMeteo();
    checkWeathering();

    return () => {
      try {
        abortOpen.abort();
      } catch {
        /* ignore */
      }
      try {
        abortWeather.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  // Fetch general historical statistics from ArcGIS layer
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const base =
          "https://services3.arcgis.com/UDCw00RKDRKPqASe/arcgis/rest/services/FLOODS_PONTS22/FeatureServer/0/query";
        const outStatistics = [
          {
            statisticType: "count",
            onStatisticField: "OBJECTID",
            outStatisticFieldName: "record_count",
          },
          {
            statisticType: "avg",
            onStatisticField: "flood_intensity",
            outStatisticFieldName: "avg_intensity",
          },
          {
            statisticType: "avg",
            onStatisticField: "flood_duration",
            outStatisticFieldName: "avg_duration",
          },
          {
            statisticType: "max",
            onStatisticField: "date",
            outStatisticFieldName: "latest_date",
          },
        ];
        const params = new URLSearchParams({
          f: "json",
          where: "1=1",
          returnGeometry: "false",
          outStatistics: JSON.stringify(outStatistics),
        });
        const resp = await fetch(`${base}?${params.toString()}`);
        const json = await resp.json();
        const attrs = json?.features?.[0]?.attributes || null;
        setHistStats(attrs);
      } catch {
        setStatsError("Failed to load historical stats");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="info-sidebar">
      <div className="info-sidebar-header">
        <h2 className="info-sidebar-title">Floods Analysis</h2>
        <p className="info-sidebar-subtitle">Insights and status</p>
      </div>

      {/* Current Analysis (Prediction from Weathering API) */}
      <div className="alerts-section section-block">
        <h3 className="section-title">Current Analysis</h3>
        {!selectedPoint ? (
          <div className="alerts-list">
            <div className="alert-item">
              <div className="alert-header">
                <span className="alert-region">
                  {selectedPoint?.name || "Select a location"}
                </span>
                <span className="alert-badge">Idle</span>
              </div>
              <div className="alert-time">Click the map to analyze risk.</div>
            </div>
          </div>
        ) : predLoading ? (
          <div className="alerts-list">
            <div className="alert-item">Analyzing risk…</div>
          </div>
        ) : predError ? (
          <div className="alerts-list">
            <div className="alert-item">{predError}</div>
          </div>
        ) : prediction ? (
          <div className="alerts-list">
            <div className="alert-item">
              <div className="alert-header">
                <span className="alert-region">
                  {selectedPoint?.name || "Flood Risk"}
                </span>
                <span
                  className={`alert-badge ${riskBadgeClass(
                    prediction.risk_level
                  )}`}
                >
                  {prediction.risk_level || "Unknown"}
                </span>
              </div>
              <div className="alert-time">
                {prediction.message || "Prediction"}
              </div>
            </div>
          </div>
        ) : (
          <div className="alerts-list">
            <div className="alert-item">No prediction available.</div>
          </div>
        )}
        {/* Download PDF button - visible only when a point is selected */}
        {selectedPoint && (
          <div style={{ marginTop: 12 }}>
            <button
              className="download-report-btn"
              disabled={exporting || predLoading || !prediction}
              onClick={async () => {
                setExporting(true);
                try {
                  await generatePdfReport({
                    selectedPoint,
                    locationName,
                    mapView,
                    prediction,
                    weatherData,
                    nearestQuake,
                  });
                } catch (err) {
                  console.error("Failed to generate PDF", err);
                  alert("Failed to generate PDF: " + (err?.message || err));
                } finally {
                  setExporting(false);
                }
              }}
            >
              <Download />
              {exporting
                ? "Generating…"
                : predLoading || !prediction
                ? "Waiting analysis…"
                : "Download Report (PDF)"}
            </button>
          </div>
        )}
      </div>

      {/* Historical Overview */}
      <div className="alerts-section section-block">
        <h3 className="section-title">Historical Overview</h3>
        {statsLoading ? (
          <div className="alerts-list">
            <div className="alert-item">Loading statistics…</div>
          </div>
        ) : statsError ? (
          <div className="alerts-list">
            <div className="alert-item">{statsError}</div>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon--success">
                <BarChart3 size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {histStats?.record_count ?? "–"}
                </div>
                <div className="stat-label">Records</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon--danger">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {histStats?.avg_intensity != null
                    ? Number(histStats.avg_intensity).toFixed(1)
                    : "–"}
                </div>
                <div className="stat-label">Avg Intensity</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon--warning">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {histStats?.avg_duration != null
                    ? Number(histStats.avg_duration).toFixed(1)
                    : "–"}
                </div>
                <div className="stat-label">Avg Duration (days)</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon--success">
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {histStats?.latest_date
                    ? new Date(histStats.latest_date).toLocaleDateString()
                    : "–"}
                </div>
                <div className="stat-label">Latest Record</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Info */}
      <div className="quick-info">
        <h3 className="section-title">System Status</h3>
        <div className="status-items">
          <div className="status-item">
            <span
              className={`status-dot ${
                openMeteoStatus === "up"
                  ? "active"
                  : openMeteoStatus === "down"
                  ? "warning"
                  : "checking"
              }`}
              aria-hidden
            ></span>
            <span className="status-text">Data Feed (Open‑Meteo)</span>
          </div>
          <div className="status-item">
            <span
              className={`status-dot ${
                weatheringStatus === "up"
                  ? "active"
                  : weatheringStatus === "down"
                  ? "warning"
                  : "checking"
              }`}
              aria-hidden
            ></span>
            <span className="status-text">Model API (Weathering)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoSidebar;
