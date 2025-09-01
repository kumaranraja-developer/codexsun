import React, { useEffect, useState } from "react";
import { ImSpinner3 } from "react-icons/im";

interface LoadingSpinner3Props {
  content?: string;
  failMessage?: string; // from props
  size?: number;
  color?: string;
  timeout?: number; // in ms
}

const LoadingSpinner3: React.FC<LoadingSpinner3Props> = ({
  content = "Loading...",
  failMessage = "Something went wrong!",
  size = 30,
  color = "#1f2937",
  timeout = 10000, // default 10 sec
}) => {
  const [showTimeoutMsg, setShowTimeoutMsg] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeoutMsg(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  if (showTimeoutMsg) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <ImSpinner3 className={`animate-spin text-${color}`} size={size} />
        <p className="text-danger font-medium">{failMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-danger text-foreground rounded hover:bg-danger"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <ImSpinner3 className={`animate-spin text-${color}`} size={size} />
      {content && (
        <p className="mt-2 text-gray-700 text-sm font-medium">{content}</p>
      )}
    </div>
  );
};

export default LoadingSpinner3;
