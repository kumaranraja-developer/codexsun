import { useState, useId, forwardRef } from "react";
import Error from '../error/Error'

interface PasswordInputProps {
  id?: string;
  label?: string;
  value: string;
  error?: string;
  className?: string;
  autoFocus?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Password_Input = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      id,
      label = "Password",
      value,
      error,
      className = "",
      autoFocus = false,
      onChange,
      onKeyDown,
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || useId();
    const togglePassword = () => setShowPassword((prev) => !prev);

    return (
      <div>
        <div className="relative w-full">
          <div className="relative w-full">
          <input
            ref={ref}
           type={showPassword ? "text" : "password"}
            id={id}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
            placeholder=" "
            autoComplete="off"
            className={`block px-2.5 pb-2.5 pt-3 w-full text-sm text-foreground/90 rounded-lg border border-ring/80 appearance-none tracking-wide dark:bg-dark dark:text-dark-9
              focus:outline-none focus:ring-2 focus:ring-ring/80 duration-300 peer ${className || ""} ${
              error ? "bg-input-warning" : "bg-transparent"
            }`}
          />

          <label
            htmlFor={id}
            className={`absolute text-sm text-foreground/50 duration-300 transform -translate-y-4 scale-75 top-2 origin-[0] px-2
              peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2
              peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-2 pointer-events-none
              ${error ? "bg-input-warning" : "bg-background"}`}
          >
            {label}
          </label>
        </div>

          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 end-0 z-20 px-3 flex items-center cursor-pointer text-gray-400 dark:text-neutral-500"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            )}
          </button>
        </div>

        {error && <Error message={error} className="mt-1 text-sm text-delete" id={inputId} />}
      </div>
    );
  }
);

Password_Input.displayName = "Password_Input";

export default Password_Input;
