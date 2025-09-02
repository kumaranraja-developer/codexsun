interface StatusBadgeProps {
  active: boolean;          // true = active, false = inactive
  label?: string ;           // optional custom label
}

export default function StatusBadge({ active, label }: StatusBadgeProps) {
  let bgColor = "";
  let textColor = "";
  let indicatorColor=""
  let displayLabel = "";

  if (active===true) {
    bgColor = "bg-green-500";
    indicatorColor = "bg-green-200";
    textColor = "text-white";
    displayLabel = label || "Active";
  } else {
    bgColor = "bg-red-500";
    indicatorColor = "bg-red-200";
    textColor = "text-white";
    displayLabel = label || "Inactive";
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}
    >
      <span className={`w-2 h-2 rounded-full mr-2 ${indicatorColor}`}></span>
      {displayLabel}
    </span>
  );
}
