import { hapiImg } from "../../../data/slidesData";

export default function HapiSlide() {
  return (
    <div
      className="slide-5-layout"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 48%",
        gap: "2rem",
        alignItems: "center",
      }}
    >
      <div className="slide-5-text slide-description">
        <p>
          Hapi is the god of the Nile's annual flood — a deity of water and
          fertility.
        </p>
        <p>
          Egyptians celebrated Hapi because the inundation left rich silt that
          made fields fertile and supported crops.
        </p>
        <p>
          Priests performed rituals to honor Hapi and help ensure a timely,
          balanced flood each year.
        </p>
      </div>
      <div className="slide-5-image-wrapper">
        <img
          src={hapiImg}
          alt="Hapi, Nile flood god"
          className="slide-5-image"
        />
      </div>
    </div>
  );
}
