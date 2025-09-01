import { useState } from "react";

interface LoadingButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LoadingButton({ className = "", children }: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);

    // Simulate async delay
    setTimeout(() => setIsLoading(false), 4000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`flex justify-center items-center px-4 h-11 text-sm font-medium rounded-lg border border-gray-200 bg-white shadow-2xs hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800 ${className}`}
    >
      {isLoading ? (
        <span
          className={`animate-spin inline-block size-4 border-[3px] border-current border-t-transparent rounded-full ${className}`}
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </span>
      ) : (
        children ?? "Submit"
      )}
    </button>
  );
}
