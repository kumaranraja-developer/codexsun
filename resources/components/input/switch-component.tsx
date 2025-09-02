import { forwardRef } from "react";

interface SwitchComponentProps {
  id: string;
  checked?: boolean | number;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  activeColor?: string;
  inactiveColor?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const SwitchComponent = forwardRef<HTMLButtonElement, SwitchComponentProps>(
  (
    {
      id,
      checked = true,
      onChange,
      disabled = false,
      className = "",
      activeColor = "bg-green-500",
      inactiveColor = "bg-gray-400",
      onKeyDown,
    },
    ref
  ) => {
    const isChecked = checked === true || checked === 1;

    const handleToggle = () => {
      if (!disabled) {
        onChange?.(!isChecked); // just notify parent
      }
    };

    return (
      <button
        id={id}
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={onKeyDown}
        className={`
          relative inline-flex h-6 w-12 items-center rounded-full 
          transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          ${isChecked ? activeColor : inactiveColor}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full bg-white transition-transform
            ${isChecked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    );
  }
);

SwitchComponent.displayName = "SwitchComponent";

export default SwitchComponent;
