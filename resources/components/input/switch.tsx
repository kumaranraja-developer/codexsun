import { forwardRef, useState, useEffect } from "react";
import SwitchComponent from "./switch-component";

interface SwitchProps {
  id: string;
  agreed?: boolean;
  label?: string;
  onChange?: (checked: boolean) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ id, agreed = true, label, onChange, onKeyDown }, ref) => {
    const [checked, setChecked] = useState<boolean>(agreed);

    useEffect(() => {
      setChecked(agreed);
    }, [agreed]);

    const handleToggle = (next: boolean) => {
      setChecked(next);
      onChange?.(next);
    };

    return (
      <div className="flex items-center gap-3">
        <SwitchComponent
          id={id}
          checked={checked}
          onChange={handleToggle}
          ref={ref}
          onKeyDown={onKeyDown}
        />
        <label
          htmlFor={id}
          className="bg-background text-foreground cursor-pointer"
          onClick={() => handleToggle(!checked)}
        >
          {label ?? (checked ? "Active" : "Inactive")}
        </label>
      </div>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
