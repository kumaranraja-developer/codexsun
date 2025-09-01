import { useEffect, useRef, useState } from "react";
import { TextArea } from "../input/text-area";
import Dropdown from "../input/dropdown";
import Switch from "../input/switch";
import Checkbox from "../input/checkbox";
import Alert from "../alert/alert";
import MultiCheckbox from "../input/multi-checkbox";
import { DatePicker } from "../datepicker/DatePicker";
import CommonTable, { type TableRowData } from "./commontable";
import { format } from "date-fns";
import apiClient from "../../../resources/global/api/apiClients";
import ImageButton from "../button/ImageBtn";
import FloatingInput from "../input/floating-input";
import DropdownRead from "../input/dropdown-read";
import Password_Input from "../secondary_input/password_Input";
import FileUpload from "../input/fileInput";
import Button from "../button/Button";

type FieldType =
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
  className: string;
  id: string;
  // key: string;
  label: string;
  type: FieldType;
  options?: string[];
  errMsg: string;
  readApi: string;
  updateApi: string;
  apiKey?: string;
  createKey?: string;
  createMenuItem?: Field[];
};

export type FieldGroup = {
  title: string;
  sectionKey?: string;
  fields: Field[];
};

type CommonFormProps = {
  groupedFields: FieldGroup[];
  isPopUp: boolean;
  formName: string;
  formOpen: boolean;
  setFormOpen?: (open: boolean) => void;
  successMsg: string;
  faildMsg: string;
  initialData?: Record<string, any>;
  onSubmit?: (data: any) => void;
  multipleEntry?: boolean;
  api: ApiList;
  mode: "create" | "edit";
};

export interface ApiList {
  create: string;
  read: string;
  update: string;
  delete: string;
}

function CommonForm({
  groupedFields,
  isPopUp,
  formName,
  formOpen,
  setFormOpen,
  successMsg,
  faildMsg,
  initialData = {},
  onSubmit,
  multipleEntry = true,
  api,
  mode,
}: CommonFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<
    "success" | "warning" | "update" | "delete"
  >("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [previewData, setPreviewData] = useState<TableRowData[]>([]);
  const [, setEditPreviewIndex] = useState<number | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateField = (field: Field, value: any): string => {
    const label = field.label.toLowerCase();
    if (
      (Array.isArray(value) && value.length === 0) ||
      value === "" ||
      value === undefined ||
      value === null ||
      (typeof value === "boolean" && value === false)
    )
      return field.errMsg;

    if (label.includes("phone") && !/^[6-9]\d{9}$/.test(value))
      return field.errMsg;
    if (label.includes("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return field.errMsg;

    return "";
  };

  const triggerAlert = (
    type: "success" | "warning" | "update" | "delete",
    message: string
  ) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleAdd = () => {
    const itemsGroup = groupedFields.find(
      (g) => g.title.toLowerCase() === "items"
    );
    if (!itemsGroup) return;

    const errors: Record<string, string> = {};
    itemsGroup.fields.forEach((field) => {
      const value = formData[field.id];
      const error = validateField(field, value);
      if (error) errors[field.id] = error;
    });

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const entryWithId: TableRowData = {
      id: `temp-${Date.now()}`,
      ...formData,
    };

    setPreviewData((prev) => [...prev, entryWithId]);

    const cleared = { ...formData };
    itemsGroup.fields.forEach((field) => {
      cleared[field.id] = "";
    });
    setFormData(cleared);
    setFormErrors({});

    setTimeout(() => {
      const first = itemsGroup.fields[0]?.id;
      if (first && inputRefs.current[first]) inputRefs.current[first]?.focus();
    }, 10);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentId: string,
    fields: Field[],
    groupTitle: string
  ) => {
    if (e.key !== "Enter") return;

    e.preventDefault();
    const currentIndex = fields.findIndex((f) => f.id === currentId);
    const nextField = fields[currentIndex + 1];

    if (nextField) {
      inputRefs.current[nextField.id]?.focus();
    } else if (groupTitle.toLowerCase() === "items" && multipleEntry) {
      handleAdd();
    }
  };

  const handleSubmit = () => {
    const fixed = { ...formData };
    for (const key in fixed) {
      const value = fixed[key];
      if (isDate(value)) {
        fixed[key] = format(value, "yyyy-MM-dd");
      }
    }

    const cleaned = Object.fromEntries(
      Object.entries(fixed).filter(([key]) => !["action"].includes(key))
    );

    let apiCall;

    if (mode === "edit") {
      const { id, ...dataToUpdate } = cleaned;
      apiCall = apiClient.put(`${api.update}/${id}`, dataToUpdate);
    } else {
      if (multipleEntry) {
        if (previewData.length === 0) {
          triggerAlert(
            "warning",
            "Please add at least one item before submitting."
          );
          return;
        }

        const payload = previewData.map((item) => {
          const cleanedItem = { ...item };
          for (const key in cleanedItem) {
            const val = cleanedItem[key];
            if (isDate(val)) {
              cleanedItem[key] = format(val, "yyyy-MM-dd");
            }
          }
          return cleanedItem;
        });
 console.log("Multiple entry payload:", payload);
        apiCall = apiClient.post(api.create, payload);
      } else {
        apiCall = apiClient.post(api.create, {
          doctype: formName,
          ...cleaned,
        });
        // apiClient.post(api.create, [cleaned])
      }
    }

    apiCall
      .then((res) => {
        const savedData = res.data;
        onSubmit?.(Array.isArray(savedData) ? savedData[0] : savedData);
        setFormData({});
        setFormErrors({});
        setPreviewData([]);
        setFormOpen?.(false);
        triggerAlert("success", successMsg);
      })
      .catch((err) => {
        console.error("❌ Submission failed:", err);
        let msg = "Submission failed";
        try {
          const serverMsg = err.response?.data?._server_messages;
          if (serverMsg) {
            const parsed = JSON.parse(serverMsg)[0];
            msg = JSON.parse(parsed)?.message || parsed;
          } else {
            msg =
              err.response?.data?.message ||
              err.response?.data?.exc_type ||
              faildMsg;
          }
        } catch {
          msg = faildMsg;
        }
        triggerAlert("warning", msg);
      });
  };

  if (!formOpen) return null;

  function isDate(val: unknown): val is Date {
    return Object.prototype.toString.call(val) === "[object Date]";
  }

  return (
    <div
      className={
        isPopUp
          ? "fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          : ""
      }
    >
      <div
        className={
          isPopUp
            ? "w-full m-5 lg:w-[70%] max-h-[90vh] overflow-y-auto bg-background text-foreground p-2 rounded-md shadow-md border border-ring/30 flex flex-col gap-2"
            : "bg-background h-full m-5 lg:my-10 text-foreground p-2 rounded-md shadow-lg border border-ring flex flex-col gap-5"
        }
      >
        <div className="flex justify-between mx-2">
          <h1 className="text-md py-2 text-foreground/50">{formName} Form</h1>
          <ImageButton
            icon="close"
            className="text-delete w-max"
            onClick={() => {
              setFormData({});
              setFormErrors({});
              setPreviewData([]);
              triggerAlert("delete", faildMsg);
              setFormOpen?.(false);
            }}
          />
        </div>

        <div className="flex flex-col gap-5 border border-ring/30 p-5 rounded-md">
          {groupedFields.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <h2 className="text- font-semibold text-primary pb-1">
                {group.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.fields.map((field) => {
                  const err = formErrors[field.id] || "";
                  const value = formData[field.id] || "";

                  const commonProps = {
                    id: field.id,
                    value,
                    err,
                    onChange: (e: any) =>
                      handleChange(field.id, e.target?.value ?? e),
                    onKeyDown: (e: any) =>
                      handleKeyDown(e, field.id, group.fields, group.title),
                    className: `${field.className} rounded-md`,
                    ref: (el: any) => (inputRefs.current[field.id] = el),
                  };

                  switch (field.type) {
                    case "textinput":
                      return (
                        <FloatingInput
                          key={field.id}
                          {...commonProps}
                          label={field.label}
                          type="text"
                        />
                      );
                    case "textarea":
                      return <TextArea {...commonProps} label={field.label} />;
                    case "dropdown":
                      return (
                        <Dropdown
                          key={field.id}
                          {...commonProps}
                          items={field.options || []}
                          placeholder={field.label}
                          readApi={field.readApi}
                          updateApi={field.updateApi}
                          apiKey={field.apiKey}
                          createKey={field.createKey}
                           createMenuItem={field.createMenuItem}
                        />
                      );
                    case "dropdownmultiple":
                      return (
                        <Dropdown
                          key={field.id}
                          {...commonProps}
                          multiple
                          items={field.options || []}
                          placeholder={field.label}
                          readApi={field.readApi}
                          updateApi={field.updateApi}
                          apiKey={field.apiKey}
                          createKey={field.createKey}
                           createMenuItem={field.createMenuItem}
                        />
                      );
                    case "dropdownread":
                      return (
                        <DropdownRead
                          key={field.id}
                          placeholder={""}
                          {...commonProps}
                          items={field.options || []}
                          label={field.label}
                          readApi={field.readApi}
                          // updateApi={field.updateApi}
                          apiKey={field.apiKey}
                        />
                      );
                    case "dropdownreadmultiple":
                      return (
                        <DropdownRead
                          key={field.id}
                          placeholder={""}
                          {...commonProps}
                          multiple
                          items={field.options || []}
                          label={field.label}
                          readApi={field.readApi}
                          // updateApi={field.updateApi}
                          apiKey={field.apiKey}
                        />
                      );
                    case "switch":
                      return (
                        <Switch
                          key={field.id}
                          {...commonProps}
                          agreed={!!value}
                          label={!!value ? "Active" : "Inactive"}
                        />
                      );
                    case "checkbox":
                      return (
                        <Checkbox
                          key={field.id}
                          {...commonProps}
                          agreed={!!value}
                          label={field.label}
                        />
                      );
                    case "multicheckbox":
                      return (
                        <MultiCheckbox
                          key={field.id}
                          {...commonProps}
                          label={field.label}
                          options={field.options || []}
                        />
                      );
                    case "password":
                      return (
                        <Password_Input
                          {...commonProps}
                          label={field.label}
                          key={field.id}
                        />
                      );
                    case "date":
                      return (
                        <DatePicker
                          key={field.id}
                          {...commonProps}
                          model={
                            value instanceof Date
                              ? value
                              : value
                                ? new Date(String(value))
                                : undefined
                          }
                          label={field.label}
                        />
                      );
                    case "file":
                      return <FileUpload key={field.id} id={field.id} />;
                    default:
                      return null;
                  }
                })}
                {mode === "create" &&
                  multipleEntry &&
                  group.title.toLowerCase() === "items" && (
                    <div className="col-span-full flex justify-end">
                      <Button
                        label="Add"
                        className="bg-create text-create-foreground"
                        onClick={handleAdd}
                      />
                    </div>
                  )}
              </div>
            </div>
          ))}

          {mode === "create" &&
            multipleEntry &&
            groupedFields.some((g) => g.title.toLowerCase() === "items") && (
              <CommonTable
                head={[
                  { key: "id", label: "ID" },
                  ...groupedFields
                    .find((g) => g.title.toLowerCase() === "items")!
                    .fields.map((f) => ({
                      key: f.id,
                      label: f.label,
                    })),
                  { key: "action", label: "Action" },
                ]}
                body={previewData.map((entry) => {
                  const fields = groupedFields.find(
                    (g) => g.title.toLowerCase() === "items"
                  )!.fields;
                  return {
                    ID: entry.id,
                    ...fields.reduce((acc, field) => {
                      const val = entry[field.id];
                      acc[field.id] = isDate(val)
                        ? (val.toLocaleDateString?.() ?? val)
                        : (val ?? "");

                      return acc;
                    }, {} as TableRowData),
                  };
                })}
                onEdit={(row, index) => {
                  setFormData(row);
                  setEditPreviewIndex(index);
                }}
                onDelete={(index) => {
                  setPreviewData((prev) => prev.filter((_, i) => i !== index));
                }}
                currentPage={1}
                rowsPerPage={10}
                totalCount={previewData.length}
                onPageChange={() => {}}
              />
            )}

          <div className="flex justify-end gap-5 mt-4">
            <Button
              label="Cancel"
              className="bg-delete text-create-foreground"
              onClick={() => {
                setFormData({});
                setFormErrors({});
                setPreviewData([]);
                triggerAlert("delete", faildMsg);
                setFormOpen?.(false);
              }}
            />
            <Button
              label="Submit"
              className="bg-create text-create-foreground"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>

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

export default CommonForm;
