import { useEffect, useRef, useState } from "react";
import ImageButton from "./ImageBtn";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react-dom";

interface ColumnOption {
  key: string;
  label: string;
}

interface ButtonDropdownProps {
  icon: string;
  columns: ColumnOption[]; // 👈 changed from string[]
  visibleColumns: string[];
  onChange: (updated: string[]) => void;
  excludedColumns?: string[];
  className?: string;
}


function ButtonDropdown({
  icon,
  columns,
  visibleColumns,
  onChange,
  excludedColumns = [], // default empty
  className,
}: ButtonDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles, update } = useFloating({
    placement: "bottom-end",
    middleware: [offset(8), flip(), shift()],
  });

  useEffect(() => {
    if (!dropdownOpen) return;
    const referenceEl = refs.reference.current;
    const floatingEl = refs.floating.current;
    if (referenceEl && floatingEl) {
      return autoUpdate(referenceEl, floatingEl, update);
    }
  }, [dropdownOpen, refs.reference, refs.floating, update]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const selectableColumns = columns
  .filter(({ key }) => !excludedColumns.includes(key));

const allSelected = selectableColumns.every(({ key }) =>
  visibleColumns.includes(key)
);

const toggleColumn = (key: string) => {
  if (excludedColumns.includes(key)) return;

  if (visibleColumns.includes(key)) {
    onChange(visibleColumns.filter((c) => c !== key));
  } else {
    onChange([...visibleColumns, key]);
  }
};

const toggleSelectAll = () => {
  const updated = allSelected
    ? visibleColumns.filter((col) => excludedColumns.includes(col))
    : [
        ...new Set([
          ...visibleColumns,
          ...selectableColumns.map(({ key }) => key),
        ]),
      ];
  onChange(updated);
};


  return (
    <div className="relative inline-block" ref={refs.setReference}>
      <ImageButton
        icon={icon}
        className={className}
        onClick={() => setDropdownOpen((prev) => !prev)}
      />

      {dropdownOpen && (
        <div
          ref={(node) => {
            dropdownRef.current = node;
            refs.setFloating(node);
          }}
          style={floatingStyles}
          className="z-50 w-56 p-2 bg-background border border-border rounded shadow-lg"
        >
          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
            <span className="font-medium">Visible Columns</span>
            <button
              onClick={toggleSelectAll}
              className="text-primary hover:underline text-xs"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1">
  {selectableColumns.map(({ key, label }) => (
    <label
      key={key}
      className="flex items-center gap-2 py-1 text-md cursor-pointer px-1 rounded hover:bg-muted/40"
    >
      <input
        type="checkbox"
        checked={visibleColumns.includes(key)}
        onChange={() => toggleColumn(key)}
        className="cursor-pointer w-4 h-4 accent-update"
      />
      {label}
    </label>
  ))}
</div>

        </div>
      )}
    </div>
  );
}

export default ButtonDropdown;
