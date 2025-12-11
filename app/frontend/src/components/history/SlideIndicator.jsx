/**
 * SlideIndicator component - displays navigation dots for slides
 * @param {Object} props
 * @param {number} props.totalSlides - Total number of slides
 * @param {number} props.currentSlide - Current active slide index
 * @param {Function} props.onSlideChange - Callback when a slide is clicked
 */
export default function SlideIndicator({
  totalSlides,
  currentSlide,
  onSlideChange,
}) {
  return (
    <div className="slide-indicator">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <button
          key={index}
          className={`indicator-dot ${index === currentSlide ? "active" : ""}`}
          onClick={() => onSlideChange(index)}
          aria-label={`Go to slide ${index + 1}`}
        >
          <span className="indicator-number">{index + 1}</span>
        </button>
      ))}
    </div>
  );
}
