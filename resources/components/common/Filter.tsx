// Filter.tsx
import React from "react";
import FloatingInput from "../input/floating-input";

interface FilterProps {
  head: string[];
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

const Filter: React.FC<FilterProps> = ({ head, filters, onFilterChange }) => {
  const filterableColumns = head.filter((column) => column.toLowerCase() !== "action");
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      {filterableColumns.map((column, i) => {
        const key = column.toLowerCase();
        return (
          <div key={i} className="flex  text-sm w-full md:w-1/2">
            <FloatingInput
              type="text"
              placeholder={`Filter ${column}`}
              value={filters[key] || ""}
              onChange={(e) => onFilterChange(key, e.target.value)}
              className="p-2 border border-ring min-w-[150px] break-words shrink-0 rounded-md text-sm bg-background text-foreground"
              id=""
              label={`Filter ${column}`}
              err=""
            />
          </div>
        );
      })}
    </div>
  );
};

export default Filter;
