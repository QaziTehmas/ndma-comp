import { useMemo, useState } from "react";
import "./BasemapSwitcher.css";

export default function BasemapSwitcher({
  current = "streets-vector",
  onChange,
}) {
  const [open, setOpen] = useState(false);

  const options = useMemo(
    () => [
      { id: "streets-vector", label: "Streets" },
      { id: "satellite", label: "Imagery" },
      { id: "topo-vector", label: "Topographic" },
      { id: "dark-gray-vector", label: "Dark Gray" },
    ],
    []
  );

  return (
    <div className={`basemap-container ${open ? "open" : "closed"}`}>
      {open && (
        <div id="basemap-panel" className="basemap-panel">
          {options.map((opt) => (
            <button
              key={opt.id}
              className={`basemap-btn ${current === opt.id ? "active" : ""}`}
              onClick={() => onChange && onChange(opt.id)}
              aria-pressed={current === opt.id}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      <button
        className={`basemap-toggle ${open ? "is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="basemap-panel"
        aria-label={open ? "Hide basemaps" : "Show basemaps"}
        title={open ? "Hide basemaps" : "Show basemaps"}
      >
        <span className="basemap-toggle-indicator">Basemap</span>
        <span className={`basemap-arrow ${open ? "open" : ""}`} aria-hidden>
          ›
        </span>
        <span className="sr-only">Basemap</span>
      </button>
    </div>
  );
}
