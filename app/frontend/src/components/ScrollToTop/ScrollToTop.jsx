import { useEffect, useState } from "react";
import "./ScrollToTop.css";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 240);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      className={`scroll-to-top ${visible ? "visible" : "hidden"}`}
      onClick={handleClick}
      aria-label="Scroll to top"
      title="Back to top"
    >
      <span className="arrow" aria-hidden>
        ↑
      </span>
    </button>
  );
}

