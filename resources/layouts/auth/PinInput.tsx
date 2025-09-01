import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

export interface PinInputHandle {
  getPinValue: () => string;
}

const PinInput = forwardRef<PinInputHandle>((_, ref) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useImperativeHandle(ref, () => ({
    getPinValue: () =>
      inputRefs.current.map((ref) => ref?.value || "").join(""),
  }));

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (/^[0-9a-zA-Z]{1}$/.test(value)) {
      if (index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      e.target.value = "";
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-x-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          autoFocus={i === 0}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}

          onChange={(e) => handleInputChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="block w-10 text-center border border-ring rounded-sm p-2 sm:text-sm focus:border-blue-500 focus:ring-blue-500
            bg-background text-foreground"
        />
      ))}
    </div>
  );
});

export default PinInput;
