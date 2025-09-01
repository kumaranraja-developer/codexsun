// SortControl.tsx
import React from "react";
import ImageButton from "../button/ImageBtn";

interface SortControlProps {
  head: string[];
  sortColumn: string;
  sortDirection: "asc" | "desc";
  setSortColumn: (column: string) => void;
  setSortDirection: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
}

const SortControl: React.FC<SortControlProps> = ({
  head,
  sortColumn,
  sortDirection,
  setSortColumn,
  setSortDirection,
}) => {
  return (
    <div className="flex items-center gap-2">
      <select
        value={sortColumn}
        onChange={(e) => setSortColumn(e.target.value)}
        className="p-2 border hidden sm:block border-ring rounded-md text-sm bg-background text-foreground"
      >
        <option value="">Sort by...</option>
        {head
          .filter((h) => h.toLowerCase() !== "action")
          .map((h, i) => (
            <option key={i} value={h}>
              {h}
            </option>
          ))}
      </select>

      <ImageButton
        onClick={() =>
          setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
        }
        disabled={!sortColumn}
        className="p-2 border border-ring rounded-md bg-muted text-sm"
        icon={sortDirection === "asc" ? "asc" : "desc"}
      />
    </div>
  );
};

export default SortControl;
