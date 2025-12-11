export default function Slide({ index, currentSlide, className = "", bgImage, children }) {
  const active = currentSlide === index ? "active" : "";
  const style = bgImage ? { backgroundImage: `url(${bgImage})` } : undefined;

  return (
    <div className={`slide ${className} ${active}`} style={style}>
      <div className="slide-content">
        <div className="content-inner">{children}</div>
      </div>
    </div>
  );
}