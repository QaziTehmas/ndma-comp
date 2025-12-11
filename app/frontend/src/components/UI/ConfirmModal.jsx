import React, { useEffect, useRef } from "react";
import "./ConfirmModal.css";

export default function ConfirmModal({
  open,
  title = "Confirm",
  description = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  const modalRef = useRef(null);
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const el = modalRef.current;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = el
      ? Array.from(el.querySelectorAll(focusableSelector))
      : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // focus the confirm button for quicker keyboard confirm
    confirmBtnRef.current?.focus();

    function handleKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel && onCancel();
      }
      if (e.key === "Tab") {
        // trap focus inside modal
        if (!first || !last) return;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKey);
    // prevent background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="ci-modal-overlay"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // close when clicking outside the modal content (overlay)
        if (e.target === e.currentTarget) {
          onCancel && onCancel();
        }
      }}
    >
      <div className="ci-modal" ref={modalRef}>
        <h3 className="ci-modal-title">{title}</h3>
        <p className="ci-modal-desc">{description}</p>
        <div className="ci-modal-actions">
          <button
            className="ci-modal-btn ci-modal-cancel"
            onClick={onCancel}
            type="button"
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            className="ci-modal-btn ci-modal-confirm"
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
