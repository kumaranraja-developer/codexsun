import React, { useState } from "react";
import Button from "../../resources/components/button/Button";

interface Step {
  title: string;
  content: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  onFinish?: () => void;
  onClose?: () => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, onFinish, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  return (
    <div className="p-4 bg-background rounded-lg shadow-md border border-ring/50 ">
      {/* Stepper Nav */}
      <ul className="relative flex flex-row overflow-scroll gap-x-2 scrollbar-hide">
        {steps.map((step, index) => (
          <li
            key={index}
            className="flex items-center gap-x-2 shrink basis-0 flex-1 group"
          >
            <span className="min-w-7 min-h-7 group inline-flex items-center text-xs align-middle">
              <span
                className={`size-7 flex justify-center items-center shrink-0 font-medium rounded-full ${
                  index < currentStep
                    ? "bg-teal-500 text-white"
                    : index === currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-white"
                }`}
              >
                {index < currentStep ? (
                  <svg
                    className="shrink-0 size-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span className="ms-2 text-sm font-medium text-gray-800 dark:text-white">
                {step.title}
              </span>
            </span>
            {index < steps.length - 1 && (
              <div className="w-full h-px flex-1 bg-gray-200 dark:bg-neutral-600" />
            )}
          </li>
        ))}
      </ul>

      {/* Stepper Content */}
      <div className="mt-5 sm:mt-8">
        <div className="p-4 scrollbar-hide overflow-scroll bg-background flex border border-ring/40 rounded-xl justify-center">
          {steps[currentStep]?.content}
        </div>

        {/* Button Group */}
        <div className="mt-5 flex justify-between items-center gap-x-2">
          <Button
            disabled={isFirst}
            onClick={() => setCurrentStep((prev) => prev - 1)}
            label="Back"
            className="py-2 px-3 inline-flex items-center gap-x-1 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50"
          />

          {!isLast ? (
            <div className="flex gap-5">
              <Button label="Cancel" className="bg-delete text-delete-foreground" onClick={onClose} />
              <Button
                label="Next"
                className="bg-update text-update-foreground"
                onClick={() => setCurrentStep((prev) => prev + 1)}
              />
            </div>
          ) : (
            <Button label="Finish" className="bg-update text-update-foreground" onClick={onFinish} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Stepper;
