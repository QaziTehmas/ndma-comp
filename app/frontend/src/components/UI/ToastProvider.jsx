import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
} from "react";
import Toast from "./Toast";
import "./Toast.css";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  const showToast = useCallback((opts) => {
    const id = String(idRef.current++);
    const toast = {
      id,
      message: opts.message || "",
      type: opts.type || "info",
      duration: opts.duration ?? 3000,
    };
    setToasts((t) => [...t, toast]);
    // auto remove after duration + fade-out buffer
    setTimeout(() => {
      // mark for removal (could animate via CSS using a class), here remove
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, toast.duration + 220);
    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="ci-toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            visible={true}
            message={t.message}
            type={t.type}
            duration={t.duration}
            onClose={() => hideToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
