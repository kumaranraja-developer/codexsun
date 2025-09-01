import { useState, useEffect, useRef, forwardRef } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import Error from "../error/Error";
import apiClient from "../../../resources/global/api/apiClients";

interface DropdownProps {
  id: string;
  className?: string;
  items: string[];
  placeholder?: string;
  label: string;
  err: string;
  multiple?: boolean;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  readApi?: string;
  apiKey?: string;
}

const DropdownRead = forwardRef<HTMLInputElement, DropdownProps>(
  (
    {
      id,
      className,
      items,
      label,
      err,
      multiple = false,
      value,
      onChange,
      onKeyDown,
      readApi,
      apiKey,
    },
    ref
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selected, setSelected] = useState<string[]>([]);
    const [direction, setDirection] = useState<"top" | "bottom">("bottom");
    const [isFocused, setIsFocused] = useState(false);
    const [localItems, setLocalItems] = useState<string[]>([]);

    useEffect(() => {
      const fetchItems = async () => {
        if (!readApi) {
          setLocalItems(items); // fallback if no API
          return;
        }

        try {
          const response = await apiClient.get(readApi);
          const data = response.data?.data || [];

          if (!data.length) {
            setLocalItems(items); // fallback to props
            return;
          }

          const key =
            apiKey ||
            (data[0]
              ? Object.keys(data[0]).find(
                  (k) => k.toLowerCase().includes("type") || k === "name"
                )
              : null);

          if (key) {
            const values: string[] = Array.from(
              new Set(
                data
                  .map((item: any) => String(item[key] ?? "").trim())
                  .filter((val: string) => val.length > 0)
              )
            );
            setLocalItems(values);
          } else {
            console.warn("No valid key found in API response:", data[0]);
            setLocalItems(items); // fallback if key missing
          }
        } catch (error) {
          console.error("Dropdown_read API fetch failed:", error);
          setLocalItems(items); // fallback on error
        }
      };

      fetchItems();
    }, [readApi, apiKey, items]);

    useEffect(() => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          setSelected(value);
        } else {
          setSelected(value ? [value] : []);
          setSearchTerm(value || "");
        }
      }
    }, [value]);
    useEffect(() => {
      const fetchItems = async () => {
        if (!readApi) return;

        try {
          const response = await apiClient.get(readApi);
          const data = response.data?.data || [];

          const key =
            apiKey ||
            (data[0]
              ? Object.keys(data[0]).find(
                  (k) => k.toLowerCase().includes("type") || k === "name"
                )
              : null);

          if (key) {
            const values: string[] = Array.from(
              new Set(
                data
                  .map((item: any) => String(item[key] ?? "").trim())
                  .filter((val: string) => val.length > 0)
              )
            );
            setLocalItems(values);
          } else {
            console.warn("No valid key found in API response:", data[0]);
          }
        } catch (error) {
          console.error("Dropdown_read API fetch failed:", error);
        }
      };

      fetchItems();
    }, [readApi, apiKey]);

    const determineDropdownDirection = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const threshold = 200;
        setDirection(
          spaceBelow < threshold && spaceAbove > threshold ? "top" : "bottom"
        );
      }
    };

    const filteredItems = localItems.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelect = (item: string) => {
      if (multiple) {
        const updated = selected.includes(item)
          ? selected.filter((i) => i !== item)
          : [...selected, item];
        setSelected(updated);
        setSearchTerm("");
        onChange?.(updated);
        setDropdownVisible(false);
      } else {
        setSelected([item]);
        setSearchTerm(item);
        onChange?.(item);
        setDropdownVisible(false);

        // ✅ Move to next field when single value selected via click
        setTimeout(() => {
          focusNextField();
        }, 10);
      }
    };
    const focusNextField = () => {
      const form = inputRef.current?.form;
      if (!form) return;

      const elements = Array.from(form.elements) as HTMLElement[];
      const index = elements.indexOf(inputRef.current!);
      for (let i = index + 1; i < elements.length; i++) {
        if (
          elements[i].tagName === "INPUT" ||
          elements[i].tagName === "TEXTAREA" ||
          elements[i].tagName === "SELECT"
        ) {
          elements[i].focus();
          break;
        }
      }
    };

    const removeItem = (item: string) => {
      const updated = selected.filter((i) => i !== item);
      setSelected(updated);
      onChange?.(updated);
      if (!multiple && updated.length === 0) {
        setSearchTerm("");
      }
    };

    const isSelected = (item: string) => selected.includes(item);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const filtered = filteredItems;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setDropdownVisible(true);
        setHighlightedIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setDropdownVisible(true);
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
          toggleSelect(filtered[highlightedIndex]);
          setHighlightedIndex(-1);
          setSearchTerm("");
          return;
        }

        // Fallback validation
        if (multiple && selected.length === 0) {
          alert("Please select at least one item.");
          return;
        } else if (!multiple && selected.length === 0) {
          alert("Please select a value.");
          return;
        }

        onKeyDown?.(e);

        const form = e.currentTarget.form;
        if (!form) return;
        const elements = Array.from(form.elements) as HTMLElement[];
        const index = elements.indexOf(e.currentTarget);
        for (let i = index + 1; i < elements.length; i++) {
          if (
            elements[i].tagName === "INPUT" ||
            elements[i].tagName === "TEXTAREA"
          ) {
            elements[i].focus();
            break;
          }
        }
      } else {
        setHighlightedIndex(-1); // reset highlight when typing
        onKeyDown?.(e);
      }
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setDropdownVisible(false);
          setIsFocused(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    return (
      <div ref={wrapperRef} className="relative w-full font-inter">
        <div
          id={id}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent input blur
            determineDropdownDirection();
            setDropdownVisible((prev) => !prev); // Toggle instead of always true
            inputRef.current?.focus();
          }}
          className={`relative flex items-center flex-wrap gap-1 px-2 pt-1.5 pb-1
            border border-ring/80 rounded-md transition-all cursor-pointer
            text-foreground/90
            ${err ? "bg-input-warning" : "bg-transparent"}
            ${
              isFocused
                ? "border-ring/30 ring-2 ring-ring/80"
                : "border-ring/80"
            }
            ${
              selected.length > 0 || searchTerm.length > 0
                ? "min-h-[2.5rem]"
                : "h-10"
            }
            ${className}`}
        >
          {multiple && selected.length > 0 && (
            <div className="flex flex-wrap overflow-x-auto max-w-full hide-scrollbar gap-1">
              {selected.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-background text-foreground/80 text-sm"
                >
                  {item}
                  <X
                    className="w-3 h-3 cursor-pointer text-foreground/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item);
                    }}
                  />
                </span>
              ))}
            </div>
          )}

          <input
            ref={(el) => {
              inputRef.current = el;
              if (typeof ref === "function") {
                ref(el);
              } else if (ref) {
                ref.current = el;
              }
            }}
            type="text"
            autoComplete="off"
            value={searchTerm}
            placeholder=" "
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setDropdownVisible(true);
              determineDropdownDirection();
            }}
            onFocus={() => {
              setIsFocused(true);
              determineDropdownDirection();
              setDropdownVisible(true); // ✅ Show the dropdown on focus
              setHighlightedIndex(0); // ✅ Optional: highlight the first item
            }}
            onBlur={() => {
              setTimeout(() => {
                if (
                  document.activeElement !== inputRef.current &&
                  !wrapperRef.current?.contains(document.activeElement)
                ) {
                  setIsFocused(false); // ✅ Reset when truly unfocused
                }
              }, 100); // Delay to allow clicks inside dropdown
            }}
            onKeyDown={handleKeyDown}
            className={`
              flex-1 px-1 py-1 text-md text-foreground/90 outline-none
              placeholder-transparent peer min-w-[50px] 
              ${err ? "bg-input-warning" : "bg-transparent"}
            `}
          />

          <label
            htmlFor={id}
            className={`
              absolute left-2.5 px-1 text-sm
              transition-all transform origin-[0] text-foreground/40
              ${err ? "bg-input-warning" : "bg-background"}
              ${
                (!multiple && (searchTerm || dropdownVisible)) ||
                (multiple &&
                  (selected.length > 0 || dropdownVisible || searchTerm))
                  ? "-top-1.5 text-xs"
                  : "top-2.5"
              }
            `}
          >
            {label}
          </label>

          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 pointer-events-none" />
        </div>

        {dropdownVisible && (
          <div
            className={`absolute left-0 right-0 z-50 max-h-[25vh] overflow-auto mt-1
              border rounded-md shadow-lg bg-background text-foreground/90
              ${direction === "bottom" ? "top-full" : "bottom-full mb-1"}
              border-ring/30`}
          >
            <ul className="list-none p-0 m-0">
              {filteredItems.length ? (
                filteredItems.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => toggleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex justify-between items-center p-2 cursor-pointer
    ${
      highlightedIndex === index ? "bg-muted text-foreground" : "hover:bg-muted"
    }`}
                  >
                    <span>{item}</span>
                    {isSelected(item) && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </li>
                ))
              ) : (
                <li className="p-2 text-center text-foreground/60">
                  No items found
                </li>
              )}
            </ul>
          </div>
        )}

        {err && <Error message={err} className="mt-1 text-sm" id={id} />}
      </div>
    );
  }
);

DropdownRead.displayName = "DropdownRead";
export default DropdownRead;
