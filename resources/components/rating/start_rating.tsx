import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface StarRatingProps {
  maxStars?: number;
  disabled?: boolean;
}

export default function StarRating({ maxStars = 5, disabled = false }: StarRatingProps) {
  const [value, setValue] = useState(0);
  const [stars, setStars] = useState(0);
  const [showRated, setShowRated] = useState(false);
  const ratedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleHover = (star: number) => {
    if (!disabled) setStars(star);
  };

  const handleMouseLeave = () => {
    if (!disabled) setStars(value);
  };

  const handleRate = (star: number) => {
    if (disabled) return;

    setValue(star);
    setStars(star);
    setShowRated(true);

    if (ratedTimeoutRef.current) clearTimeout(ratedTimeoutRef.current);
    ratedTimeoutRef.current = setTimeout(() => setShowRated(false), 2000);
  };

  const handleReset = () => {
    if (!disabled) {
      setValue(0);
      setStars(0);
    }
  };

  const StarIcon = ({ filled }: { filled: boolean }) =>
    filled ? (
      <svg
        className="w-6 h-6 text-yellow-400 fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
      >
        <path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z" />
      </svg>
    ) : (
      <svg
        className="w-6 h-6 text-gray-300 fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
      >
        <path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z" />
      </svg>
    );

  return (
    <div className="flex flex-col items-center justify-center max-w-6xl mx-auto">
      <AnimatePresence>
        {showRated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute mt-[-2rem] mb-10 text-xs text-gray-400"
          >
            Rated {value} Star{value !== 1 ? "s" : ""}
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="flex">
        {Array.from({ length: maxStars }, (_, i) => {
          const star = i + 1;
          return (
            <li
              key={star}
              className={`px-1 cursor-pointer ${disabled ? "text-gray-400 cursor-not-allowed" : ""}`}
              onMouseEnter={() => handleHover(star)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleRate(star)}
            >
              <StarIcon filled={star <= stars} />
            </li>
          );
        })}
      </ul>

      <button
        onClick={handleReset}
        className="inline-flex items-center px-2 py-1 mt-3 text-xs text-gray-600 bg-gray-200 rounded-full hover:bg-black hover:text-white disabled:opacity-50"
        disabled={disabled}
      >
        <svg className="w-3 h-3 mr-1" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
          <polyline
            points="24 56 24 104 72 104"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="24"
          />
          <path
            d="M67.59,192A88,88,0,1,0,65.77,65.77L24,104"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="24"
          />
        </svg>
        <span>Reset</span>
      </button>
    </div>
  );
}
