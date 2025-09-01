import React, { useEffect, useRef, useState } from "react";

interface NotificationItem {
  date: string;
  title: string;
  description?: string;
  user?: {
    name: string;
    avatar?: string;
    initial?: string;
  };
  icon?: React.ReactNode;
}

interface NotificationCardProps {
  items: NotificationItem[];
  onClose?: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ items, onClose }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const sortedItems = [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const visibleItems = sortedItems.slice(0, visibleCount);
  const hasMore = visibleCount < sortedItems.length;

  return (
    <div
      ref={cardRef}
      className="bg-background rounded-md  border border-border/70 p-4 scrollbar-hide"
    >
      {visibleItems.map((item, index) => (
        <div key={`${item.date}-${index}`} className="flex gap-x-3 mb-3">
          {/* timeline indicator */}
          <div className="relative">
            <div className="relative z-10 size-7 flex justify-center items-center">
              <div className="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"></div>
            </div>
            {index !== visibleItems.length - 1 && (
              <div className="absolute top-7 bottom-0 start-3.5 w-px bg-gray-200 dark:bg-neutral-700" />
            )}
          </div>

          {/* Content */}
          <div className="grow">
            <h3 className="text-xs font-medium uppercase text-gray-500 dark:text-neutral-400 mb-1">
              {new Date(item.date).toLocaleDateString()}
            </h3>
            <h4 className="font-semibold text-gray-800 dark:text-white">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-gray-600 dark:text-neutral-400">{item.description}</p>
            )}
            {item.user && (
              <button
                type="button"
                className="mt-1 -ms-1 p-1 inline-flex items-center gap-x-2 text-xs rounded-lg text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                {item.user.avatar ? (
                  <img
                    className="shrink-0 size-4 rounded-full"
                    src={item.user.avatar}
                    alt="Avatar"
                  />
                ) : (
                  <span className="flex shrink-0 justify-center items-center size-4 bg-white border border-gray-200 text-[10px] font-semibold uppercase text-gray-600 rounded-full dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400">
                    {item.user.initial}
                  </span>
                )}
                {item.user.name}
              </button>
            )}
          </div>
        </div>
      ))}

      {/* More / Less Buttons */}
      {sortedItems.length > 5 && (
        <div className="text-end mt-2">
          {hasMore ? (
            <button
              type="button"
              className="inline-flex items-center gap-x-1 text-sm text-blue-600 font-medium hover:underline dark:text-blue-500"
              onClick={() => setVisibleCount((prev) => prev + 5)}
            >
              <svg className="shrink-0 size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Show more
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-x-1 text-sm text-blue-600 font-medium hover:underline dark:text-blue-500"
              onClick={() => setVisibleCount(5)}
            >
              <svg className="shrink-0 size-3.5 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
