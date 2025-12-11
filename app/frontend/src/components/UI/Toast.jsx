import React, { useEffect, useState, useRef } from "react";
import "./Toast.css";
import { BadgeCheck, BadgeX } from "lucide-react";

export default function Toast({
  visible,
  message,
  type = "info",
  onClose,
  duration = 3000,
}) {
  const [exiting, setExiting] = useState(false);
  const autoHideRef = useRef();

  useEffect(() => {
    if (!visible) return;
    // start auto-hide timer
    autoHideRef.current = setTimeout(() => {
      setExiting(true);
      // wait for exit animation then call onClose
      setTimeout(() => onClose && onClose(), 180);
    }, duration);
    return () => clearTimeout(autoHideRef.current);
  }, [visible, duration, onClose]);

  const handleClose = () => {
    clearTimeout(autoHideRef.current);
    setExiting(true);
    setTimeout(() => onClose && onClose(), 180);
  };

  if (!visible) return null;

  const renderIcon = () => {
    if (type === "success") return <BadgeCheck className="ci-toast-icon" />;
    if (type === "error") return <BadgeX className="ci-toast-icon" />;
    return null;
  };

  return (
    <div
      className={`ci-toast ci-toast-${type} ${
        exiting ? "ci-toast-exit" : "ci-toast-enter"
      }`}
      role="status"
      aria-live="polite"
    >
      {renderIcon()}
      <div className="ci-toast-message">{message}</div>
      <button
        className="ci-toast-close"
        onClick={handleClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
