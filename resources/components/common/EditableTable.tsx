import { useEffect, useRef, useState } from "react";
import { Datepicker } from "../secondary_input/datepicker";
import MultiCheckbox from "../input/multi-checkbox";
import Switch from "../input/switch";
import Checkbox from "../input/checkbox";
import Dropdown from "../secondary_input/dropdown";
import Password_Input from "../secondary_input/password_Input";
import AnimateButton from "../button/animatebutton";
import ImageButton from "../button/ImageBtn";
import Dropdown_read from "../secondary_input/dropdown_read";
import FileUpload from "../input/fileInput";
import {TextInput} from "../secondary_input/TextInput";
import {TextArea} from "../secondary_input/TextArea"; // ✅ Ensure this path is correct

export type FieldType =
  | "textinput"
  | "textarea"
  | "dropdown"
  | "switch"
  | "checkbox"
  | "calendar"
  | "multicheckbox"
  | "password"
  | "date"
  | "file"
  | "dropdownread"
  | "dropdownreadmultiple"
  | "dropdownmultiple";

export type Field = {
  className?: string;
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  errMsg?: string;
  placeholder?: string;
  optional?: boolean;
  readApi?: string;
  updateApi?: string;
  apiKey?: string;
  createKey?: string;
  multiple?: boolean;
};

export interface ApiList {
  create: string;
  read: string;
  update: string;
  delete: string;
}

interface EditableTableProps {
  fields: Field[];
  onChange?: (data: Record<string, any>[]) => void;
  initialData?: Record<string, any>[];
}

const phoneRegex = /^[0-9]{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EditableTable({
  fields,
  onChange,
  initialData = [],
}: EditableTableProps) {
  const [tableData, setTableData] = useState<Record<string, any>[]>(
    initialData.length > 0
      ? initialData
      : [Object.fromEntries(fields.map((f) => [f.id, ""]))]
  );
  const [editingRow, setEditingRow] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const inputRefs = useRef<(HTMLElement | null)[][]>([]);

  useEffect(() => {
    inputRefs.current = tableData.map(() => fields.map(() => null));
  }, [tableData.length, fields.length]);

  const handleChange = (rowIndex: number, fieldId: string, value: any) => {
    const updated = [...tableData];
    updated[rowIndex][fieldId] = value;
    setTableData(updated);
    onChange?.(updated);
  };

  const isValidValue = (field: Field, value: any): boolean => {
    if (!field.optional && (value === "" || value === null || value === undefined)) {
      alert(`Field "${field.label}" cannot be empty`);
      return false;
    }

    const idLower = field.id.toLowerCase();
    if (idLower.includes("email") && value && !emailRegex.test(value)) {
      alert(`Invalid email in "${field.label}"`);
      return false;
    }

    if (idLower.includes("phone") && value && !phoneRegex.test(value)) {
      alert(`Invalid phone number in "${field.label}"`);
      return false;
    }

    if (
      (field.type === "dropdownread" || field.type === "dropdownreadmultiple") &&
      field.options &&
      value
    ) {
      if (field.type === "dropdownreadmultiple") {
        const invalid = (value as string[]).some((v) => !field.options?.includes(v));
        if (invalid) {
          alert(`One or more invalid values in "${field.label}"`);
          return false;
        }
      } else {
        if (!field.options.includes(value)) {
          alert(`Invalid value in "${field.label}"`);
          return false;
        }
      }
    }

    return true;
  };

  const focusNextField = (rowIndex: number, colIndex: number) => {
    const currentField = fields[colIndex];
    const currentValue = tableData[rowIndex][currentField.id];

    if (!isValidValue(currentField, currentValue)) return;

    const nextCol = colIndex + 1;
    const nextRow = rowIndex + 1;

    if (nextCol < fields.length) {
      const nextInput = inputRefs.current[rowIndex]?.[nextCol];
      nextInput?.focus?.();
    } else if (nextRow < tableData.length) {
      setEditingRow(nextRow);
      setTimeout(() => inputRefs.current[nextRow]?.[0]?.focus?.(), 0);
    } else {
      const newRow = Object.fromEntries(fields.map((f) => [f.id, ""]));
      const updated = [...tableData, newRow];
      setTableData(updated);
      setEditingRow(updated.length - 1);
      onChange?.(updated);
      setTimeout(() => inputRefs.current[updated.length - 1]?.[0]?.focus?.(), 0);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      focusNextField(rowIndex, colIndex);
    }
  };

  const toggleRowSelect = (rowIndex: number) => {
    setSelectedRows((prev) =>
      prev.includes(rowIndex)
        ? prev.filter((i) => i !== rowIndex)
        : [...prev, rowIndex]
    );
  };

  const deleteSelectedRows = () => {
    const updated = tableData.filter((_, index) => !selectedRows.includes(index));
    setTableData(updated);
    setSelectedRows([]);
    onChange?.(updated);
  };

  const renderFieldInput = (
    field: Field,
    value: any,
    rowIndex: number,
    colIndex: number
  ) => {
    const commonProps = {
      key: `${rowIndex}-${field.id}`,
      ref: (el: HTMLElement | null) => {
        if (!inputRefs.current[rowIndex]) inputRefs.current[rowIndex] = [];
        inputRefs.current[rowIndex][colIndex] = el;
      },
      disabled: editingRow !== rowIndex,
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) =>
        handleKeyDown(e, rowIndex, colIndex),
      className: `w-full ${field.className || ""} ${editingRow !== rowIndex ? "opacity-50" : ""}`,
    };

    switch (field.type) {
      case "textinput":
        return <TextInput id={""} err={""} {...commonProps} label={field.label} type="text" />;
      case "textarea":
        return <TextArea err={""} {...commonProps} label={field.label} />;
      case "dropdown":
      case "dropdownmultiple":
        return (
          <Dropdown
          id={""} err={""}
          // readApi={""}
          // updateApi={""}
          {...commonProps}
          items={field.options || []}
          multiple={field.type === "dropdownmultiple"}
          placeholder={field.label}            // apiKey={field.apiKey}
            // createKey={field.createKey}
          />
        );
      case "dropdownread":
      case "dropdownreadmultiple":
        return (
          <Dropdown_read
            id={""} err={""} placeholder={""}
            {...commonProps}
            label={field.label}
            items={field.options || []}
            multiple={field.type === "dropdownreadmultiple"}            // readApi={field.readApi}
            // apiKey={field.apiKey}
          />
        );
      case "switch":
        return (
          <Switch
          id={""} onChange={function (): void {
            throw new Error("Function not implemented.");
          } } {...commonProps}
          agreed={!!value}
          label={!!value ? "Active" : "Inactive"}          />
        );
      case "checkbox":
        return <Checkbox id={""} err={""} onChange={function (): void {
          throw new Error("Function not implemented.");
        } } {...commonProps} agreed={!!value} label={field.label} />;
      case "multicheckbox":
        return (
          <MultiCheckbox
          id={""} value={[]} err={""} onChange={function (): void {
            throw new Error("Function not implemented.");
          } } {...commonProps}
          label={field.label}
          options={field.options || []}          />
        );
      case "password":
        return <Password_Input value={""} onChange={function (): void {
          throw new Error("Function not implemented.");
        } } {...commonProps} label={field.label} />;
      case "date":
        return (
          <Datepicker
            {...commonProps}
            model={value instanceof Date ? value : value ? new Date(value) : undefined}
            label={field.label}
          />
        );
      case "file":
        return (
          <FileUpload
            key={field.id}
            id={field.id}
            onChange={(file) => handleChange(rowIndex, field.id, file)}
            multiple={field.multiple}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left rounded-t-md">
              <th className="px-2 py-2 text-center border border-gray-200">
                <input
                  type="checkbox"
                  checked={selectedRows.length === tableData.length && tableData.length > 0}
                  onChange={(e) =>
                    setSelectedRows(
                      e.target.checked ? tableData.map((_, i) => i) : []
                    )
                  }
                />
              </th>
              <th className="px-2 py-2 border border-gray-200 text-center w-[50px]">No.</th>
              {fields.map((field, i) => (
                <th key={i} className="px-2 py-2 border border-gray-200 whitespace-nowrap text-sm font-medium">
                  {field.label}
                  {!field.optional && <span className="text-red-500 ml-1">*</span>}
                </th>
              ))}
              <th className="px-2 py-2 text-center border border-gray-200 w-[40px]">
                <span className="inline-block w-4 h-4">⚙️</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white border-t border-gray-200 hover:bg-gray-50">
                <td className="text-center border border-gray-200 px-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(rowIndex)}
                    onChange={() => toggleRowSelect(rowIndex)}
                  />
                </td>
                <td className="text-center border border-gray-200 px-2 py-1 font-mono text-sm text-gray-800">
                  {rowIndex + 1}
                </td>
                {fields.map((field, colIndex) => (
                  <td key={field.id} className="border border-gray-200 px-2 py-1 whitespace-nowrap">
                    {renderFieldInput(field, row[field.id], rowIndex, colIndex)}
                  </td>
                ))}
                <td className="text-center border border-gray-200 px-2 py-1">
                  <ImageButton
                    icon="edit"
                    onClick={() => setEditingRow(rowIndex)}
                    className="text-muted-foreground hover:text-foreground"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col gap-6 my-10 text-lg">
          <AnimateButton
            mode="create"
            label="New Row"
            className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            onClick={() => {
              const newRow = Object.fromEntries(fields.map((f) => [f.id, ""]));
              const updated = [...tableData, newRow];
              setTableData(updated);
              setEditingRow(updated.length - 1);
              onChange?.(updated);
              setTimeout(() => {
                const firstInput = inputRefs.current[updated.length - 1]?.[0];
                if (firstInput) firstInput.focus();
              }, 0);
            }}
          />
        </div>
      </div>

      {selectedRows.length > 0 && (
        <AnimateButton
          mode="delete"
          label="Delete"
          className="text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          onClick={deleteSelectedRows}
        />
      )}
    </div>
  );
}

export default EditableTable;
