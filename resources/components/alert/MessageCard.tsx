import React, { useEffect, useRef, useState } from "react";

interface MessageCardItem {
  date: string;
  description?: string;
  user?: {
    name: string;
    avatar?: string;
    initial?: string;
  };
}

interface MessageCardProps {
  items: MessageCardItem[];
  onClick: () => void; // onClickOutside
}

const MessageCard: React.FC<MessageCardProps> = ({ items, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClick();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClick]);

  // Sort by date descending
  const sortedItems = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const visibleItems = sortedItems.slice(0, visibleCount);

  const hasMore = visibleCount < sortedItems.length;

  // Group visible items by date
  const groupedByDate = visibleItems.reduce<Record<string, MessageCardItem[]>>((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const visibleDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div ref={ref} className="w-80 h-80 overflow-auto bg-background rounded-md shadow-lg shadow-black/40 ring-2 ring-ring/20 border border-border/30 p-4 scrollbar-hide">
      {visibleDates.map((date) => (
        <React.Fragment key={date}>
          <div className="ps-2 my-2 first:mt-0">
            <h3 className="text-xs font-medium uppercase text-gray-500 dark:text-neutral-400">
              {new Date(date).toLocaleDateString()}
            </h3>
          </div>

          {groupedByDate[date].map((item, idx) => (
            <div key={`${date}-${idx}`} className="flex gap-x-3">
              {/* Icon line */}
              <div className="relative last:after:hidden after:absolute after:top-7 after:bottom-0 after:start-3.5 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 dark:after:bg-neutral-700">
                <div className="relative z-10 size-7 flex justify-center items-center">
                  <div className="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"></div>
                </div>
              </div>

              {/* Content */}
              <div className="grow pt-0.5 pb-8">
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
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}

      {/* Show More / Less Button */}
      {items.length > 5 && (
        <div className="ps-2 -ms-px flex gap-x-3">
          <button
            type="button"
            className="text-start inline-flex items-center gap-x-1 text-sm text-blue-600 font-medium hover:underline dark:text-blue-500"
            onClick={() =>
              hasMore ? setVisibleCount((prev) => prev + 5) : setVisibleCount(5)
            }
          >
            <svg
              className={`shrink-0 size-3.5 transition-transform ${
                hasMore ? "" : "rotate-180"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {hasMore ? "Show more" : "Show less"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageCard;
