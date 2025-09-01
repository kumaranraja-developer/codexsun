import React, { useEffect, useRef, useState } from 'react';

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
  showCollapse?: boolean;
    onClose?: () => void;
}

const NotificationCard2: React.FC<NotificationCardProps> = ({ items, showCollapse = false,onClose }) => {
  const [collapsed, setCollapsed] = useState(true);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const groupedByDate = items.reduce<Record<string, NotificationItem[]>>((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const visibleDates = showCollapse && collapsed ? dates.slice(0, 2) : dates;

  return (
    <div
      ref={cardRef}
      className='w-80 h-80 overflow-auto bg-background rounded-md shadow-lg shadow-black/40 ring-2 ring-ring/20 border border-border/30 p-4 scrollbar-hide'
    >
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
              <div className="grow pt-0.5 pb-4">
                <h3 className="flex gap-x-1.5 font-semibold text-gray-800 dark:text-white">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">{item.description}</p>
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
        </React.Fragment>
      ))}

      {showCollapse && dates.length > 2 && (
        <div className="ps-2 -ms-px flex gap-x-3">
          <button
            type="button"
            className="text-start inline-flex items-center gap-x-1 text-sm text-blue-600 font-medium hover:underline dark:text-blue-500"
            onClick={() => setCollapsed(!collapsed)}
          >
            <svg className="shrink-0 size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {collapsed ? "Show older" : "Show less"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCard2;
