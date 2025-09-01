import React, { useState } from "react";

interface RangeSliderProps {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 50,
  onChange,
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
    onChange?.(newValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <label htmlFor="range-slider" className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Value indicator */}
      <div className="relative h-4 mb-2">
        <div
          className="absolute left-0 transform -translate-x-1/2 text-xs text-primary font-medium"
          style={{ left: `${percentage}%` }}
        >
          {value}
        </div>
      </div>

      {/* Range Slider */}
      <input
        id="range-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full bg-transparent cursor-pointer appearance-none focus:outline-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:-mt-0.5
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(37,99,235,1)]
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:transition-all
          [&::-webkit-slider-thumb]:duration-150
          [&::-webkit-slider-thumb]:ease-in-out
          dark:[&::-webkit-slider-thumb]:bg-neutral-700

          [&::-moz-range-thumb]:w-3
          [&::-moz-range-thumb]:h-3
          [&::-moz-range-thumb]:appearance-none
          [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:border-4
          [&::-moz-range-thumb]:border-blue-600
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:transition-all
          [&::-moz-range-thumb]:duration-150
          [&::-moz-range-thumb]:ease-in-out

          [&::-webkit-slider-runnable-track]:w-full
          [&::-webkit-slider-runnable-track]:h-2
          [&::-webkit-slider-runnable-track]:bg-gray-200
          [&::-webkit-slider-runnable-track]:rounded-full
          dark:[&::-webkit-slider-runnable-track]:bg-neutral-700

          [&::-moz-range-track]:w-full
          [&::-moz-range-track]:h-2
          [&::-moz-range-track]:bg-gray-200
          [&::-moz-range-track]:rounded-full"
      />

      {/* Min / Max labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
