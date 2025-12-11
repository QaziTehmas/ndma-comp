import { slide1Img } from "../../../data/slidesData";

export default function IntroSlide() {
  return (
    <div className="slide-1-layout">
      <div className="slide-1-text">
        <p className="intro-text-large">
          Floods occur when water covers land that's normally dry, often caused
          by heavy rain, rapid snowmelt, storm surges, or infrastructure
          failures.
        </p>
        <p className="intro-text-large">
          They may strike suddenly or build up over time, lasting from hours to
          weeks and damaging homes and infrastructure.
        </p>
        <p className="intro-text-large">
          Flooding happens when water overflows rivers or coasts, or when rain
          falls faster than the ground can absorb it.
        </p>
      </div>
      <div className="slide-1-image-wrapper">
        <img src={slide1Img} alt="Flood scene" className="slide-1-image" />
      </div>
    </div>
  );
}
