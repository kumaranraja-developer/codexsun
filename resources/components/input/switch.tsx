import { forwardRef } from "react";
import { SwitchComponent } from "./switch-component";

interface SwitchProps {
  id: string;
  agreed: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

// Forward ref to the underlying focusable element (usually the switch button)
const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ id, agreed, label, onChange, onKeyDown }, ref) => {
    return (
      <div className="flex items-center gap-3">
        <SwitchComponent
          id={id}
          checked={agreed}
          onCheckedChange={onChange}
          ref={ref} // ✅ forward ref
          onKeyDown={onKeyDown} // ✅ handle Enter key
        />
        <label
          htmlFor={id}
          className="bg-background text-foreground cursor-pointer"
        >
          {label}
        </label>
      </div>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
