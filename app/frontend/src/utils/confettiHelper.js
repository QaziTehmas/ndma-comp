import confetti from "canvas-confetti";

const CONFETTI_DURATION_MS = 3000;
const CONFETTI_COLORS = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

export function triggerConfetti() {
  const myConfetti = confetti.create(null, {
    resize: true,
    useWorker: true,
  });

  const end = Date.now() + CONFETTI_DURATION_MS;

  function frame() {
    if (Date.now() > end) return;

    myConfetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors: CONFETTI_COLORS,
    });

    myConfetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors: CONFETTI_COLORS,
    });

    requestAnimationFrame(frame);
  }

  frame();
}
