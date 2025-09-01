import { useState, type KeyboardEvent } from "react";
import Button from "../button/Button";
interface FormField {
  label: string;
  input: "input" | "textarea" | "image";
  type: string;
  style: string;
  isList: boolean;
  list: string[];
  placeholder:string;
}

function Form() {
  // Initial form configuration with list fields
  const [form, setForm] = useState<FormField[]>([
    { label: "Product Name", input: "input", type: "text", style: "p-2 border rounded-md", isList: false, list: [] ,placeholder:'' },
    { label: "Description", input: "textarea", type: "text", style: "p-2 h-[25vh] border rounded-md", isList: false, list: [] ,placeholder:'' },
    { label: "Color Available", input: "input", type: "text", style: "p-2 border rounded-md", isList: true, list: [] ,placeholder:'' },
    { label: "Size Available", input: "input", type: "text", style: "p-2 border rounded-md", isList: true, list: [] ,placeholder:'press enter to enter multiple values' },
    { label: "Cost Price", input: "input", type: "number", style: "p-2 border rounded-md", isList: false, list: [] ,placeholder:'' },
    { label: "Selling Price", input: "input", type: "number", style: "p-2 border rounded-md", isList: false, list: [] ,placeholder:'' },
    { label: "Dress Material", input: "input", type: "text", style: "p-2 border rounded-md", isList: false, list: [] ,placeholder:'' },
    { label: "Gender", input: "input", type: "text", style: "p-2 border rounded-md", isList: false, list: [] ,placeholder:'' },
    { label: "Age Group", input: "input", type: "text", style: "p-2 border rounded-md", isList: false, list: [] ,placeholder:'' },
    { label: "NeckLine", input: "input", type: "text", style: "p-2 border rounded-md", isList: false, list: [] ,placeholder:'' },
    { label: "Image", input: "image", type: "file", style: "p-2 border rounded-md", isList: false, list: [] ,placeholder:'' },
  ]);

  // Stores simple (single) field values by index
  const [fieldValues, setFieldValues] = useState<Record<number, string>>({});

// Stores the new item to add to a list field by index
  const [newValues, setNewValues] = useState<Record<number, string>>({});

// Handle adding a new item to a list-type field
const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
  if (e.key === "Enter") {
    e.preventDefault();

    if (newValues[index]?.trim()) {
      setForm((prevForm) =>
        prevForm.map((item, idx) =>
          idx === index
            ? { ...item, list: [...item.list, newValues[index].trim()] }
            : item
        )
      );
      setNewValues((prev) => ({
        ...prev,
        [index]: "",
      }));
    }
  }
};

const handleDelete = (itemIndex: number, listIndex: number) => {
  setForm((prevForm) =>
    prevForm.map((item, idx) =>
      idx === itemIndex
        ? { 
            ...item, 
            list: item.list.filter((_, i) => i !== listIndex) 
          }
        : item
    )
  );
};

// const handleFileChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
//   console.log(e.target.files);
// };

  return (
    <div className="flex flex-col justify-center p-10 items-center">
      <h1 className="text-3xl py-10 font-semibold">
        Product Description
      </h1>
      <div className="flex flex-col gap-5 w-[90%] md:w-[70%] lg:w-[50%]">
        {form.map((item, index) => (
          <div key={index} className="flex flex-col gap-2">
            <label htmlFor="">{item.label}</label>

            {/* Input or Textarea or Image picker*/}
            {item.input === "input" ? (
              <input
                type={item.type}
                placeholder={item.placeholder}
                className={`p-2 border capitalize ${item.style}`}
                onKeyDown={(e) => item.isList && handleKeyDown(e, index)}
                onChange={(e) =>
                    item.isList
                    ? setNewValues((prev) => ({
                        ...prev,
                        [index]: e.target.value,
                    }))
                    : setFieldValues((prev) => ({
                        ...prev,
                        [index]: e.target.value,
                    }))
                }
                value={
                    item.isList
                    ? newValues[index] ?? ""
                    : fieldValues[index] ?? ""
                }
              />
            ) : item.input === "textarea" ? (
              <textarea
                className={`p-2 border capitalize ${item.style}`}
                placeholder={item.placeholder}
                onChange={(e) =>
                    setFieldValues((prev) => ({
                    ...prev,
                    [index]: e.target.value,
                   }))
                }
                value={fieldValues[index] ?? ""}
              ></textarea>
            ) : item.input === "image" ? (
              <input
                type="file"
                className={`p-2 border ${item.style}`}
                // onChange={(e) => handleFileChange(e, index)}
              />
            ) : null}

            {/* List Display (if applicable)*/}
            {item.isList && item.list.length > 0 && (
              <ul className="bg-gray-100 p-2 rounded-md mt-">
                {item.list.map((listItem, i) => (
                    <li key={i} className="p-2 flex items-center justify-between">
                    <span>{listItem}</span>
                    <button
                      onClick={() => handleDelete(index, i)}
                      aria-label="Delete item"
                      className="text-red-500 ml-2">
                      Delete
                    </button>
                    
                    </li>
                ))}
              </ul>
            )}

          </div>
        ))}
        <Button label={"Submit"} className="bg-green-600 text-gray-50 p-2 rounded-md mt-4" children={undefined} />
      </div>
    </div>
  );
}

export default Form;

