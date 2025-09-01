import React, { useState, useRef } from "react";
import { Fireworks } from "@fireworks-js/react";
import { Howl } from "howler";

interface CrackerAnimationProps {
  quote?: string;
  duration?: number; // in ms
  onFinish?: () => void;
  explosion1: string;
  explosion2: string;
  explosion3: string;
  flag: string;
  logo: string;
}

const CrackerAnimation: React.FC<CrackerAnimationProps> = ({
  quote = "Let's Begin the Journey!",
  duration = 5000,
  onFinish,
  explosion1,
  explosion2,
  explosion3,
  flag,
  logo,
}) => {
  const [show, setShow] = useState(false);
  const fireworksRef = useRef<any>(null);
  const soundRef = useRef<Howl | null>(null);

  const startLaunch = () => {
    const alreadyShown = localStorage.getItem("Independence Day");
    if (alreadyShown) {
      onFinish?.();
      return;
    }

    setShow(true);

    // Play sound manually
    soundRef.current = new Howl({
      src: [explosion1, explosion2, explosion3],
      volume: 0.8,
    });
    soundRef.current.play();

    // Start fireworks
    fireworksRef.current?.start();

    // Stop after duration
    setTimeout(() => {
      fireworksRef.current?.stop();
      soundRef.current?.stop(); // Stop the sound explicitly
      setShow(false);
      localStorage.setItem("Independence Day", "true");
      onFinish?.();
        // localStorage.removeItem("Independence Day"); //testing
    }, duration);
  };

  if (!show) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-[99999999]">
        <button
          onClick={startLaunch}
          className="px-6 py-3 bg-primary text-background mx-3 rounded-lg font-bold hover:bg-hover transition-all duration-200 cursor-pointer"
        >
          Let’s Celebrate Together 🚀
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-[99999999]">
      {/* Top-left Indian flag */}
      <video
        src={flag}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-4 right-4 w-32 md:w-64 h-auto"
      />
      {/* Top-right Indian flag */}
      <video
        src={flag}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-4 left-4 w-32 md:w-64 h-auto"
      />
      <Fireworks
        ref={fireworksRef}
        options={{
          rocketsPoint: { min: 50, max: 50 },
          hue: { min: 0, max: 360 },
          delay: { min: 20, max: 30 },
          acceleration: 1.02,
          friction: 0.95,
          gravity: 1.5,
          particles: 60,
          explosion: 2,
          sound: { enabled: false },
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <div className="mb-10">
        <img src={logo} alt="" className="w-64 md:w-128" />
      </div>{" "}
      <h1 className="text-5xl font-bold mb-4 animate-bounce text-center relative ">
        Welcome to Tech Media!
      </h1>
      <p className="text-xl italic text-center px-4 relative z-10 ">{quote}</p>
    </div>
  );
};

export default CrackerAnimation;
