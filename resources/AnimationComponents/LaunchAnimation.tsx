import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Howl } from "howler";

interface LaunchAnimationProps {
  quote?: string;
  duration?: number; // in ms
  onFinish?: () => void;
  mp3: string;
}

const LaunchAnimation: React.FC<LaunchAnimationProps> = ({
  quote = "Let's Begin the Journey!",
  duration = 5000,
  onFinish,
  mp3,
}) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startLaunch = () => {
    // Prevent multiple runs
    const alreadyShown = localStorage.getItem("launchAnimationShown");
    if (alreadyShown) {
      if (onFinish) onFinish();
      return;
    }

    setShow(true);

    // Play sound
    const sound = new Howl({
      src: [mp3],
      volume: 0.8,
    });
    sound.play();

    // Stop after duration
    setTimeout(() => {
      sound.stop();
      setShow(false);
      localStorage.setItem("launchAnimationShown", "true");
      if (onFinish) onFinish();
    }, duration);
  };

  // If already shown, skip button & animation
  if (localStorage.getItem("launchAnimationShown")) {
    localStorage.removeItem("launchAnimationShown"); //testing purpose only, remove this during project deploy
    return null;
  }
  // Show button if not running yet
  if (!show) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-[9999]">
        <button
          onClick={startLaunch}
          className="px-6 py-3 bg-yellow-500 text-black rounded-lg font-bold hover:bg-yellow-400 transition-all duration-200"
        >
          🚀 Start Launch Celebration
        </button>
      </div>
    );
  }

  // Show animation
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-[9999]">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        numberOfPieces={300}
        recycle={true}
      />
      <h1 className="text-5xl font-bold mb-4 animate-bounce">
        🚀 Welcome to eCart!
      </h1>
      <p className="text-xl italic text-center px-4">{quote}</p>
    </div>
  );
};

export default LaunchAnimation;
