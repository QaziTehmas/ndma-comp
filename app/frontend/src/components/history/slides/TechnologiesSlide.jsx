import { TECH_STACK } from "../../../data/slidesData";

export default function TechnologiesSlide() {
  return (
    <div className="slide-description">
      <div className="tech-grid" role="list">
        {TECH_STACK.map((tech, idx) => (
          <div key={idx} className="tech-item" role="listitem">
            <img className="tech-icon" src={tech.icon} alt={tech.label} />
            <div className="tech-label">{tech.label}</div>
          </div>
        ))}
      </div>
      <p>
        <strong>Data science & collection:</strong> Model training and
        evaluation (Python, Pandas, scikit-learn). <strong>ArcGIS tools</strong>{" "}
        used for mapping and spatial analysis.
      </p>
    </div>
  );
}
