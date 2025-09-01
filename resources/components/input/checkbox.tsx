
import Error from '../error/Error'

interface CheckboxProps {
  id: string;
  agreed: boolean;
  label: string;
  err: string;
  className: string;
  onChange: (checked: boolean) => void;
}

function Checkbox({ id, agreed, label, err, className, onChange }: CheckboxProps) {
  return (
    <div>
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          checked={agreed}
           style={err ? { borderColor: 'var(--color-error)' } : {}}
          onChange={(e) => onChange(e.target.checked)}
          className={`accent-blue-600 w-5 h-5 ${className}`}
        />
        <span className="text-foreground">{label}</span>
      </label>
      {err && <Error message={err} id={id} />}
    </div>
  );
}

export default Checkbox;
