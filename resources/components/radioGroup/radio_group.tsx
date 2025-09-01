import React, { useState } from "react";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const Radio_group: React.FC<RadioGroupProps> = ({
  name,
  options,
  defaultValue,
  onChange,
}) => {
  const [selected, setSelected] = useState(defaultValue ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelected(value);
    onChange?.(value);
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const isSelected = selected === option.value;

        return (
          <label
            key={option.value}
            className={`flex items-start gap-3 cursor-pointer border rounded-md p-3 transition-all
              ${
                isSelected
                  ? "border-update/80 bg-background text-foreground"
                  : "border-ring/30 bg-background text-foreground"
              }
              hover:bg-ring/30`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={handleChange}
              className="mt-1 w-4 h-4 accent-update"
            />
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{option.label}</span>
              {option.description && (
                <span className="text-sm text-secondary-foreground">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};

export default Radio_group;
