import { chartImg } from '../../../data/slidesData';

export default function ClimateSlide() {
  return (
    <>
      <div className="slide-description">
        <p className="slide-intro-text">
          Climate change strongly affects how often and how severely floods occur. 
          Warmer global temperatures allow the atmosphere to hold more moisture, 
          resulting in heavier and more intense rainfall.
        </p>
        <p>
          Rising sea levels and changing precipitation patterns increase both coastal 
          and inland flood risks worldwide.
        </p>
      </div>
      <div className="slide-chart">
        <img src={chartImg} alt="Climate change chart" />
      </div>
    </>
  );
}