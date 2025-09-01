import { useEffect, useState } from "react";
import { TextArea } from "../input/text-area";
import Dropdown from "../input/dropdown";
import Switch from "../input/switch";
import Checkbox from "../input/checkbox";
import Alert from "../alert/alert";
import MultiCheckbox from "../input/multi-checkbox";
import PasswordInput from "../input/password-input";
import { DatePicker } from "../datepicker/datepicker";
import FileUpload from "../input/fileInput";
import DropdownRead from "../input/dropdown-read";
import ImageButton from "../button/ImageBtn";
import EditableTable from "./EditableTable";
import FloatingInput from "../input/floating-input";
import Button from "../button/Button";

type FieldType =
  | "textinput"
  | "textarea"
  | "dropdown"
  | "switch"
  | "checkbox"
  | "multicheckbox"
  | "password"
  | "date"
  | "file"
  | "dropdownread"
  | "dropdownreadmultiple"
  | "dropdownmultiple";

export type Field = {
  className: string;
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  errMsg: string;
};

type EntryFormProps = {
  groupedFields: {
    title: string;
    sectionKey: string;
    fields: Field[];
  }[];
  isPopUp: boolean;
  formName: string;
  formOpen: boolean;
  setFormOpen?: (open: boolean) => void;
  successMsg: string;
  faildMsg: string;
  initialData?: Record<string, any>;
  onSubmit?: (data: any) => void;
};

function EntryForm({
  groupedFields,
  isPopUp,
  formName,
  formOpen,
  setFormOpen,
  successMsg,
  faildMsg,
  initialData = {},
  onSubmit,
}: EntryFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<
    "success" | "warning" | "update" | "delete"
  >("success");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const triggerAlert = (
    type: "success" | "warning" | "update" | "delete",
    message: string
  ) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  if (!formOpen) return null;

  const wrapperClass = isPopUp
    ? "bg-black/80 w-full h-full fixed top-0 left-0 z-50 flex items-center justify-center"
    : "";

  const containerClass = isPopUp
    ? "w-full m-5 lg:w-[70%] max-h-[90vh] overflow-y-auto bg-background scrollbar-hide text-foreground p-2 rounded-md shadow-md border border-ring/30 flex flex-col gap-2"
    : "bg-background h-full m-5 lg:my-10 text-foreground p-2 rounded-md shadow-lg border border-ring flex flex-col gap-5";

  return (
    <div className={wrapperClass}>
      <div className={containerClass}>
        {/* header */}
        <div className="flex justify-between mx-2">
          <h1 className="text-md py-2 text-foreground/50">{formName} Form</h1>
          <ImageButton
            icon="close"
            className="text-delete w-max"
            onClick={() => {
              setFormData({});
              setFormErrors({});
              triggerAlert("delete", faildMsg);
              setFormOpen?.(false);
            }}
            children={undefined}
          />
        </div>

        {/* Form Sections */}
        <div className="flex flex-col gap-5 border border-ring/30 p-5 rounded-md">
          {groupedFields.map((section) => (
            <div key={section.title} className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-foreground border-b pb-1">
                {section.title}
              </h2>

              {section.sectionKey === "items" ? (
                <div id="popup-container">
                <EditableTable fields={section.fields} />

                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {section.fields.map((field) => {
                    const err = formErrors[field.id] || "";
                    const value = formData[field.id] || "";

                    return (
                      <div key={field.id} className="w-full">
                        {(() => {
                          switch (field.type) {
                            case "textinput":
                              return (
                                <FloatingInput
                                  id={field.id}
                                  label={field.label}
                                  type="text"
                                  placeholder={`Enter ${field.label}`}
                                  value={value}
                                  err={err}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                  className={`p-2 border border-gray-500 rounded-md ${field.className}`}
                                />
                              );
                            case "textarea":
                              return (
                                <TextArea
                                  id={field.id}
                                  label={field.label}
                                  placeholder={`Enter ${field.label}`}
                                  value={value}
                                  err={err}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                  className={`p-2 border border-gray-500 rounded-md ${field.className}`}
                                />
                              );
                            case "dropdown":
                              return (
                                <Dropdown
                                  id={field.id}
                                  items={field.options || []}
                                  value={value}
                                  onChange={(val) => handleChange(field.id, val)}
                                  err={err}
                                  className={`border-gray-400 w-full rounded-md p-2 ${field.className}`} readApi={""} updateApi={""}                                />
                              );
                            case "dropdownmultiple":
                              return (
                                <Dropdown
                                  id={field.id}
                                  items={field.options || []}
                                  value={value}
                                  multiple
                                  onChange={(val) => handleChange(field.id, val)}
                                  err={err}
                                  className={`border-gray-400 w-full rounded-md p-2 ${field.className}`} readApi={""} updateApi={""}                                />
                              );
                            case "dropdownread":
                              return (
                                <DropdownRead
                                  id={field.id}
                                  items={field.options || []}
                                  placeholder={`Select ${field.label}`}
                                  label={field.label}
                                  value={value}
                                  onChange={(val) =>
                                    handleChange(field.id, val)
                                  }
                                  err={err}
                                  className={`border-gray-400 w-full rounded-md p-2 ${field.className}`}
                                />
                              );
                            case "dropdownreadmultiple":
                              return (
                                <DropdownRead
                                  id={field.id}
                                  items={field.options || []}
                                  placeholder={`Select ${field.label}`}
                                  label={field.label}
                                  value={value}
                                  multiple
                                  onChange={(val) =>
                                    handleChange(field.id, val)
                                  }
                                  err={err}
                                  className={`border-gray-400 w-full rounded-md p-2 ${field.className}`}
                                />
                              );
                            case "switch":
                              return (
                                <Switch
                                  id={field.id}
                                  agreed={!!value}
                                  label={!!value ? "Active" : "Inactive"}
                                  onChange={(checked) =>
                                    handleChange(field.id, checked)
                                  }
                                />
                              );
                            case "checkbox":
                              return (
                                <Checkbox
                                  id={field.id}
                                  agreed={!!value}
                                  label={field.label}
                                  err={err}
                                  onChange={(checked) =>
                                    handleChange(field.id, checked)
                                  }
                                  className={`p-2 border border-gray-500 rounded-md ${field.className}`}
                                />
                              );
                            case "multicheckbox":
                              return (
                                <MultiCheckbox
                                  id={field.id}
                                  options={field.options || []}
                                  value={value || []}
                                  err={err}
                                  className={field.className}
                                  label={field.label}
                                  onChange={(val) =>
                                    handleChange(field.id, val)
                                  }
                                />
                              );
                            case "date":
                              return (
                                <DatePicker
                                  id={field.id}
                                  label={field.label}
                                  model={
                                    value instanceof Date
                                      ? value
                                      : value
                                      ? new Date(value)
                                      : undefined
                                  }
                                  formatStr="MMM dd, yyyy"
                                  err={err}
                                  onChange={(date) =>
                                    handleChange(field.id, date)
                                  }
                                  className={field.className}
                                />
                              );
                            case "password":
                              return (
                                <PasswordInput
                                  id={field.id}
                                  label={`Enter ${field.label}`}
                                  value={value}
                                  error={err}
                                  onChange={(e) =>
                                    handleChange(field.id, e.target.value)
                                  }
                                />
                              );
                            case "file":
                              return <FileUpload id={field.id} />;
                            default:
                              return null;
                          }
                        })()}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Buttons */}
          <div className="flex justify-end gap-5 mt-4">
            <Button
              label="Cancel"
              className="bg-delete text-create-foreground w-max"
              onClick={() => {
                setFormData({});
                setFormErrors({});
                triggerAlert("delete", faildMsg);
                setFormOpen?.(false);
              }}
              children={undefined}
            />
            <Button
              label="Submit"
              className="bg-create w-max text-create-foreground"
              onClick={() => {
                onSubmit?.(formData);
                triggerAlert("success", successMsg);
                setFormOpen?.(false);
              }}
              children={undefined}
            />
          </div>
        </div>
      </div>

      {/* Alert */}
      <div className="absolute top-0 right-0">
        <Alert
          type={alertType}
          message={alertMessage}
          show={alertVisible}
          onClose={() => setAlertVisible(false)}
        />
      </div>
    </div>
  );
}

export default EntryForm;


  //  {formOpen && (
  //       <EntryForm
  //        groupedFields={groupedFields}
  //         isPopUp
  //         formOpen={formOpen}
  //         setFormOpen={setFormOpen}
  //         formName="Sales"
  //         successMsg="Form submitted successfully"
  //         faildMsg="Form submission failed"
  //         initialData={Array.isArray(editData) ? {} : editData}
  //         onSubmit={handleFormSubmit}
  //       />
  //     )}