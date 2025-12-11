import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function useConfetti(currentSlide, confettiTriggeredRef) {
  useEffect(() => {
    if (currentSlide === 9 && !confettiTriggeredRef.current) {
      confettiTriggeredRef.current = true;

      const myConfetti = confetti.create(null, {
        resize: true,
        useWorker: true,
      });

      const end = Date.now() + 3000;
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

      function frame() {
        if (Date.now() > end) return;

        myConfetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors,
        });

        myConfetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors,
        });

        requestAnimationFrame(frame);
      }

      frame();
    }

    if (currentSlide !== 9) {
      confettiTriggeredRef.current = false;
    }
  }, [currentSlide]);
}