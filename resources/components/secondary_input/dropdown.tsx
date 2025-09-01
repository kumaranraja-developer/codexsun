import { useState, useEffect, useRef, forwardRef } from "react";
import { Check, X, ChevronDown, PlusCircle } from "lucide-react";
import Error from '../error/Error'
import CreateMenu from "../common/CreateMenu";

interface DropdownProps {
  id: string;
  className?: string;
  items: string[];
  onChange?: (value: string | string[]) => void;
  err: string;
  multiple?: boolean;
  value?: string | string[];
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const Dropdown = forwardRef<HTMLInputElement, DropdownProps>(
  ({ id, className, items, onChange, err, multiple = false, value, onKeyDown, placeholder }, ref) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selected, setSelected] = useState<string[]>([]);
    const [direction, setDirection] = useState<"top" | "bottom">("bottom");
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const [isExited, setIsExited] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [localItems, setLocalItems] = useState<string[]>(items);

    useEffect(() => {
      setLocalItems(items);
    }, [items]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          closeDropdown();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selected, multiple, localItems, searchTerm]);

    useEffect(() => {
      if (value !== undefined) {
        if (multiple && Array.isArray(value)) {
          setSelected(value);
        } else if (!multiple && typeof value === "string") {
          setSelected([value]);
          setSearchTerm(value);
        }
      }
    }, [value, multiple]);

    const determineDropdownDirection = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const threshold = 200;
        setDirection(spaceBelow < threshold && spaceAbove > threshold ? "top" : "bottom");
      }
    };

    const closeDropdown = () => {
      setDropdownVisible(false);
      setHighlightedIndex(-1);
      if (!multiple && selected.length) {
        setSearchTerm(selected[0]);
      } else if (multiple && searchTerm.trim() !== "") {
        if (!localItems.some((item) => item.toLowerCase() === searchTerm.toLowerCase())) {
          setSearchTerm("");
        }
      }
    };

    const filteredItems = localItems.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const itemNotPresent =
      searchTerm.trim().length > 0 &&
      !localItems.some((item) => item.toLowerCase() === searchTerm.toLowerCase());

    const toggleSelect = (item: string) => {
      if (!item) return;
      const isNewItem = !localItems.includes(item);
      if (isNewItem) setLocalItems((prev) => [...prev, item]);

      if (multiple) {
        const updated = selected.includes(item)
          ? selected.filter((i) => i !== item)
          : [...selected, item];
        setSelected(updated);
        onChange?.(updated);
        setSearchTerm("");
      } else {
        setSelected([item]);
        setSearchTerm(item);
        onChange?.(item);
      }

      inputRef.current?.focus();
      setDropdownVisible(false);
      setHighlightedIndex(-1);
      setIsExited(false);
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const trimmed = searchTerm.trim();
      const exactMatch = localItems.find(
        (item) => item.toLowerCase() === trimmed.toLowerCase()
      );

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setDropdownVisible(true);
        setHighlightedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
        setIsExited(false);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setDropdownVisible(true);
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
        setIsExited(false);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (multiple) {
          if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
            toggleSelect(filteredItems[highlightedIndex]);
          }
          else if (exactMatch) {
            toggleSelect(exactMatch);
          }
          else if (trimmed === "") {
            if (isExited) {
              onKeyDown?.(e);
              setIsExited(false);
            } else {
              setIsExited(true);
              setDropdownVisible(false);
            }
          }else {
            setDropdownVisible(false);
            setIsCreating(true);
          }
        } else {
          if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
            toggleSelect(filteredItems[highlightedIndex]);
          } else if (exactMatch) {
            toggleSelect(exactMatch);
          } else if (filteredItems.length > 0) {
            toggleSelect(filteredItems[0]);
          } else if (itemNotPresent) {
            setDropdownVisible(false);
            setIsCreating(true);
            return; 
          }
          onKeyDown?.(e);
        }
      } else if (e.key === "Escape") {
        closeDropdown();
        setIsExited(false);
      } else {
        setIsExited(false);
        onKeyDown?.(e);
      }
    };

    const handleCreateClick = () => {
      setDropdownVisible(false);
      setIsCreating(true);
    };

    return (
      <div ref={wrapperRef} className="relative w-full font-inter">
        <div
          id={id}
          onClick={() => {
            determineDropdownDirection();
            setDropdownVisible(true);
            inputRef.current?.focus();
            setIsExited(false);
          }}
          className={`relative flex items-center flex-wrap gap-1 px-2 pt-1.5 pb-1
            rounded-md transition-all cursor-pointer
            bg-dashboard-background text-foreground/90
            ${selected.length > 0 || searchTerm.length > 0 ? "min-h-[2.5rem]" : "h-10"}
            ${className}
          `}
        >
          {multiple && selected.length > 0 && (
            <div className="flex flex-wrap overflow-x-auto max-w-full hide-scrollbar gap-1">
              {selected.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-foreground/80 text-sm"
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
              if (typeof ref === "function") ref(el);
              else if (ref) ref.current = el;
            }}
            type="text"
            value={searchTerm}
           placeholder={placeholder}

            onFocus={() => {
              setDropdownVisible(true);
              determineDropdownDirection();
              setIsExited(false);
            }}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setDropdownVisible(true);
              determineDropdownDirection();
              setHighlightedIndex(0);
              setIsExited(false);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent px-1 py-1 text-sm text-foreground/90 outline-none border-none min-w-[50px]"
          />

          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 pointer-events-none" />
        </div>

        {dropdownVisible && (
          <div
            className={`absolute left-0 right-0 z-50 max-h-[25vh] overflow-auto mt-1
              rounded-md shadow-lg
              bg-background text-foreground/90
              ${direction === "bottom" ? "top-full" : "bottom-full mb-1"}
            `}
          >
            <ul className="list-none p-0 m-0">
              {filteredItems.length ? (
                filteredItems.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => toggleSelect(item)}
                    className={`flex justify-between items-center p-2 cursor-pointer 
                      ${highlightedIndex === index ? "bg-muted" : "hover:bg-muted"}
                    `}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span>{item}</span>
                    {isSelected(item) && <Check className="w-4 h-4 text-blue-600" />}
                  </li>
                ))
              ) : (
                <li className="p-2 text-center text-foreground/60">No items found</li>
              )}
            </ul>

            {itemNotPresent && (
              <button
                className="p-4 w-full text-left border-t flex gap-2 text-blue-600 hover:bg-muted border-gray-200 dark:border-neutral-700"
                onClick={handleCreateClick}
              >
                <PlusCircle />
                Create "{searchTerm}"
              </button>
            )}
          </div>
        )}

        {isCreating && (
          <CreateMenu
            defaultValue={searchTerm}
            onClose={() => setIsCreating(false)}
            onAdd={(newItem: string) => {
              if (!newItem.trim()) return;
              const updatedItems = [...localItems, newItem];
              setLocalItems(updatedItems);

              if (multiple) {
                const updatedSelected = [...selected, newItem];
                setSelected(updatedSelected);
                setSearchTerm("");
                onChange?.(updatedSelected);
              } else {
                setSelected([newItem]);
                setSearchTerm(newItem);
                onChange?.(newItem);
              }

              inputRef.current?.focus();
              setIsCreating(false);
            }}
          />
        )}

        {err && <Error message={err} className="mt-1 text-sm text-red-500" id={id} />}
      </div>
    );
  }
);

Dropdown.displayName = "Dropdown";
export default Dropdown;
