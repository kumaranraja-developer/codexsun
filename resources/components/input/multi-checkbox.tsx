import Error from '../error/Error'

interface MultiCheckboxProps {
  id: string;
  options: string[];
  className: string;
  value: string[]; // selected options
  err?: string;
  label: string;
  onChange: (selectedValues: string[]) => void;
}

function MultiCheckbox({
  id,
  options,
  className,
  value,
  err,
  label,
  onChange,
}: MultiCheckboxProps) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className={`bg-background ${err ? 'text-error':' text-foreground'} block font-medium mb-1`}>{label}</label>

      {options.map((option) => (
        <div key={`${id}-${option}`} className="flex items-center space-x-2">
          <input
            id={`${id}-${option}`}
            type="checkbox"
             style={err ? { borderColor: 'var(--color-error)' } : {}}
            checked={value.includes(option)}
            onChange={() => toggleOption(option)}
            className="accent-blue-600 w-5 h-5 cursor-pointer"
          />
          <label htmlFor={`${id}-${option}`} className="text-foreground cursor-pointer">
            {option}
          </label>
        </div>
      ))}

      {err && <Error message={err} className="mt-1" id={id} />}
    </div>
  );
}

export default MultiCheckbox;
