import { Bell, Mail, MessageSquare, AlertCircle, type LucideIcon } from "lucide-react";

interface NotificationButtonProps {
  icon?: "bell" | "mail" | "message" | "alert"; 
  label?: string;
  count?: number;
  mode?: "auto" | "icon" | "label";
  onClick?: () => void;
}

const iconsMap: Record<string, LucideIcon> = {
  bell: Bell,
  mail: Mail,
  message: MessageSquare,
  alert: AlertCircle,
};

export default function NotificationButton({
  icon = "bell",
  label = "Notification",
  count = 0,
  mode = "auto",
  onClick
}: NotificationButtonProps) {
  const Icon = iconsMap[icon] || Bell;
  const showFull = mode === "label" || (mode === "auto" && count > 0);

  return showFull ? (
    // Button with label and count
    <button
      type="button"
      onClick={onClick}
      className="relative py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
    >
      {label}
      {count > 0 && (
        <span className="flex absolute top-0 end-0 -mt-2 -me-2">
          <span className="animate-ping absolute inline-flex size-full rounded-full bg-red-400 opacity-75 dark:bg-red-600"></span>
          <span className="relative inline-flex text-xs bg-red-500 text-white rounded-full py-0.5 px-1.5">
            {count > 9 ? "9+" : count}
          </span>
        </span>
      )}
    </button>
  ) : (
    // Icon-only badge
    <button
      onClick={onClick}
      type="button"
      className="relative inline-flex justify-center p-2 items-center size-9 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
    >
      <Icon className="w-6 h-6" />
      {count > 0 && (
        <span className="flex absolute top-0 end-0 size-3 -mt-1.5 -me-1.5">
          <span className="animate-ping absolute inline-flex size-full rounded-full bg-red-400 opacity-75 dark:bg-red-600"></span>
          <span className="relative inline-flex rounded-full size-3 bg-red-500"></span>
        </span>
      )}
    </button>
  );
}
