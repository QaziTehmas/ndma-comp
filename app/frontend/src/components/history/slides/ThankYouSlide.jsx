import { useNavigate } from "react-router-dom";

export default function ThankYouSlide() {
  const navigate = useNavigate();
  return (
    <div className="thankyou-wrap">
      <div className="thankyou-panel">
        <h1 className="slide-title thankyou-title">
          Thank you for your attention
        </h1>
        <p className="slide-subtitle">
          Stay safe — and keep an eye on the water.
        </p>
        <button
          className="theme-button start-analysis-btn"
          onClick={() => navigate("/analyze")}
        >
          Start your analysis
        </button>
      </div>
      <div className="celebration">
        <div className="water-wave" aria-hidden="true" />
      </div>
    </div>
  );
}
