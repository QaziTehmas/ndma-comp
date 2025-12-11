import { useState, useEffect } from "react";
import { Monitor, X } from "lucide-react";
import "./DeviceNoticeModal.css";

export default function DeviceNoticeModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen the notice
    const seen = localStorage.getItem("deviceNoticeSeen");

    // Check if device is mobile/tablet
    const isMobile = window.innerWidth < 1024;

    if (!seen && isMobile) {
      setIsVisible(true);

      // Auto-close after 10 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("deviceNoticeSeen", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          className="modal-close"
          onClick={handleClose}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="modal-icon">
          <Monitor size={48} strokeWidth={1.5} />
        </div>

        <h2 className="modal-title">Best Viewing Experience</h2>

        <p className="modal-message">
          For the optimal experience with our interactive story map, we
          recommend viewing on a <strong>PC or laptop</strong>.
        </p>

        <p className="modal-submessage">
          The full-screen presentations and interactive features work best on
          larger displays.
        </p>

        <button className="modal-button" onClick={handleClose}>
          Got it, Continue
        </button>

        <div className="modal-timer">Auto-closing in 10 seconds...</div>
      </div>
    </div>
  );
}
