import Error from '../error/Error'
import { MdErrorOutline } from "react-icons/md";
import React, { useId, forwardRef } from "react";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id?: string;
  label: string;
  err: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ id, label, err, className = "", rows = 4, value, onChange, ...rest }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="relative w-full">
        <textarea
          id={textareaId}
          ref={ref}
          placeholder=" "
          rows={rows}
          value={value}          // ✅ Bind value
          onChange={onChange}    // ✅ Bind onChange
          className={`
            peer block px-2.5 pb-2.5 pt-4 w-full text-sm rounded-lg border border-ring/80
            appearance-none focus:outline-none focus:ring-2 focus:ring-ring
            peer-placeholder-transparent ${className}
            ${err ? "bg-input-warning" : "bg-transparent"}
          `}
          {...rest}
        />

        <label
          htmlFor={textareaId}
          className={`absolute text-sm text-foreground/40 px-2 transition-all
            transform -translate-y-4 scale-75 top-2 origin-[0] start-1 pointer-events-none
            peer-placeholder-shown:top-1/5 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2
            peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4
            ${err ? "bg-input-warning" : "bg-background"}
          `}
        >
          {label}
        </label>

        {err && (
          <>
            <MdErrorOutline className="absolute right-3 top-3 text-red-500 text-xl" />
            <Error message={err} className="text-sm mt-1" id={textareaId} />
          </>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
