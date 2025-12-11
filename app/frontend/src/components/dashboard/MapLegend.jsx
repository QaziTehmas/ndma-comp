import { useState } from "react";
import "./MapLegend.css";

export default function MapLegend({
  showFlood = true,
  showQuakes = true,
  onToggle,
}) {
  const [open, setOpen] = useState(false);

  const handleToggle = (key) => {
    if (onToggle) onToggle(key);
  };

  return (
    <div className={`legend-container ${open ? "open" : "closed"}`}>
      {open && (
        <div id="legend-panel" className="legend-panel">
          <div className="legend-section">
            <div className="legend-title-row">
              <label className="legend-checkbox">
                <input
                  type="checkbox"
                  checked={showFlood}
                  onChange={() => handleToggle("flood")}
                />
                <span className="legend-title">Floods Intensity</span>
              </label>
            </div>
            <ul className="legend-list">
              <li>
                <span className="swatch swatch-vlow" /> Very Low
              </li>
              <li>
                <span className="swatch swatch-low" /> Low
              </li>
              <li>
                <span className="swatch swatch-mod" /> Moderate
              </li>
              <li>
                <span className="swatch swatch-high" /> High
              </li>
              <li>
                <span className="swatch swatch-vhigh" /> Very High
              </li>
            </ul>
          </div>

          <div className="legend-section">
            <div className="legend-title-row">
              <label className="legend-checkbox">
                <input
                  type="checkbox"
                  checked={showQuakes}
                  onChange={() => handleToggle("quakes")}
                />
                <span className="legend-title">Earthquake Heatmap</span>
              </label>
            </div>
            <div
              className="heatmap-gradient"
              aria-label="Earthquake heatmap scale"
            />
            <div className="heatmap-labels">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
            <div className="legend-note">
              Hotter colors highlight areas with more and/or stronger recent
              earthquakes.
            </div>
          </div>
        </div>
      )}
      <button
        className={`legend-toggle ${open ? "is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="legend-panel"
        aria-label={open ? "Hide legend" : "Show legend"}
        title={open ? "Hide legend" : "Show legend"}
      >
        <span className="legend-toggle-indicator">Legend</span>
        <span className={`legend-arrow ${open ? "open" : ""}`} aria-hidden>
          ›
        </span>
      </button>
    </div>
  );
}
