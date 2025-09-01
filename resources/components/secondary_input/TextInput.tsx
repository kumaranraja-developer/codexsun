import Error from '../error/Error'
import { MdErrorOutline } from "react-icons/md";
import React, { forwardRef } from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  err: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, label, err, className = "", ...props }, ref) => {
    return (
      <div className="w-full items-start flex flex-col gap-1">
       

        <div className="relative w-full bg-background text-foreground">
          <input
            ref={ref}
            id={id}
            placeholder={label}
            className={`w-full bg-dashboard-background p-2 text-foreground rounded-sm peer text-sm placeholder-transparent border-none outline-none ring-0 ${className}`}
            {...props}
          />

          {err && (
            <MdErrorOutline
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xl"
              aria-hidden="true"
            />
          )}
        </div>

        {err && <Error message={err} className="mt-1" id={id} />}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
