import { useEffect, useRef, useState } from "react";
import Button from "../../../resources/components/button/Button";
import { Field } from "../common/commonform";
import { renderField } from "../../../resources/UIBlocks/form/TabForm";


type CreateMenuProps = {
  onClose: () => void;
  onAdd: (item: string | Record<string, any>) => void;
  fields: Field[]; 
};

function CreateMenu({ onClose, onAdd, fields }: CreateMenuProps) {
  // Initialize formData dynamically based on fields
  const initialData: Record<string, any> = fields.reduce(
    (acc, f) => ({ ...acc, [f.id]: "" }),
    {}
  );

  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const inputRefs = useRef<Record<string, any>>({});

  // Focus first field on mount
  useEffect(() => {
    const firstKey = Object.keys(inputRefs.current)[0];
    if (firstKey) inputRefs.current[firstKey]?.focus();
  }, []);

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAdd = () => {
    const emptyField = Object.entries(formData).find(([_, v]) => !v);
    if (emptyField) {
      alert(`Please enter a value for "${emptyField[0]}"`);
      return;
    }

    onAdd(formData);
    console.log("Creating item payload:", formData);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    const keys = Object.keys(formData);
    const nextKey = keys[idx + 1];
    if (nextKey) inputRefs.current[nextKey]?.focus();
    else handleAdd();
  };

  return (
    <div className="bg-black/80 w-full h-full fixed top-0 left-0 z-50 flex items-center justify-center">
      <div className="w-[50%] bg-background text-foreground p-5 rounded-md shadow-md border border-ring flex flex-col gap-5">
        {fields.map((f, idx) => {
          const value = formData[f.id];
          const commonProps = {
            id: f.id,
            value,
            className: f.className,
            onChange: (e: any) => handleChange(f.id, e.target?.value ?? e),
            onKeyDown: (e: any) => handleKeyDown(e, idx),
            ref: (el: any) => (inputRefs.current[f.id] = el),
          };
          return <div key={f.id}>{renderField(f, commonProps, value)}</div>;
        })}

        <div className="flex justify-end gap-5">
          <Button
            label="Cancel"
            onClick={onClose}
            className="bg-red-600 w-max text-white"
          />
          <Button
            label="Submit"
            onClick={handleAdd}
            className="bg-green-600 w-max text-white"
          />
        </div>
      </div>
    </div>
  );
}

export default CreateMenu;
