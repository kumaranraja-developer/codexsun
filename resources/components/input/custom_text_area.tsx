import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface CustomTextAreaProps {
  id: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function Custom_text_area({
  id,
  placeholder = "",
  value = "",
  onChange,
  className = "",
}: CustomTextAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(value ?? "");

  // Sync external value to internal state
  useEffect(() => {
    if (ref.current && value !== undefined && value !== ref.current.innerText) {
      ref.current.innerText = value;
      setContent(value);
    }
  }, [value]);

  const handleInput = () => {
    const text = ref.current?.innerText ?? "";
    setContent(text);
    onChange?.(text);
  };

  return (
    <div className="relative w-full">
      {/* Show placeholder when content is empty */}
      {content.trim() === "" && (
        <div className="absolute left-3 top-3 text-gray-400 pointer-events-none text-sm select-none">
          {placeholder}
        </div>
      )}

      <div
        id={id}
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className={clsx(
          "border border-ring/50 rounded-md p-3 text-sm outline-none min-h-[200px] overflow-auto whitespace-pre-wrap",
          "focus:ring-2 focus:ring-foreground/30",
          className
        )}
      />
    </div>
  );
}
