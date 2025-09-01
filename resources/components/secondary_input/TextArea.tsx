import Error from '../error/Error'
import { MdErrorOutline } from "react-icons/md";
import React, { useId, forwardRef } from "react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id?: string;
  label: string;
  err: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ id, label, err, className = "", rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="relative w-full">
        <textarea
          id={textareaId}
          ref={ref}
          placeholder={label}
          rows={rows}
          className={`
            block px-3 py-2 w-full text-sm text-gray-900 bg-transparent rounded-lg
            appearance-none dark:text-white dark:bg-dark
            border-none outline-none ring-0
            ${className}
          `}
          {...props}
        />

        {err && (
          <MdErrorOutline
            className="absolute right-3 top-3 text-red-500 text-xl"
            aria-hidden="true"
          />
        )}
        {err && <Error message={err} className="text-red-500 mt-1" id={textareaId} />}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
