import SlideIndicator from "./SlideIndicator";

export default function NavigationControls({
  currentSlide,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  onSlideChange,
}) {
  return (
    <div className="indicator-stack">
      {currentSlide > 0 && (
        <button
          className="nav-arrow nav-arrow-up nav-arrow--compact"
          onClick={onPrevSlide}
          aria-label="Previous slide"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}

      <SlideIndicator
        totalSlides={totalSlides}
        currentSlide={currentSlide}
        onSlideChange={onSlideChange}
      />

      {currentSlide < totalSlides - 1 && (
        <button
          className="nav-arrow nav-arrow-down nav-arrow--compact"
          onClick={onNextSlide}
          aria-label="Next slide"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      )}
    </div>
  );
}
