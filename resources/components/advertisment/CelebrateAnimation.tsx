import { useCallback } from "react";
import confetti from "canvas-confetti";

function CelebrateAnimation() {
  const handleClick = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
    >
      Run Confetti
    </button>
  );
}

export default CelebrateAnimation;
