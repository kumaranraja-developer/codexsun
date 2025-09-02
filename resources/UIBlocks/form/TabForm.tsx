import { useEffect, useRef, useState } from "react";
import { TextArea } from "../../components/input/text-area";
import Dropdown from "../../components/input/dropdown";
import Switch from "../../components/input/switch";
import Checkbox from "../../components/input/checkbox";
import Alert from "../../components/alert/alert";
import MultiCheckbox from "../../components/input/multi-checkbox";
import { DatePicker } from "../../components/datepicker/DatePicker";
import CommonTable, {
  type TableRowData,
} from "../../components/common/commontable";
import { format } from "date-fns";
import apiClient from "../../global/api/apiClients";
import ImageButton from "../../components/button/ImageBtn";
import FloatingInput from "../../components/input/floating-input";
import DropdownRead from "../../components/input/dropdown-read";
import Password_Input from "../../components/secondary_input/password_Input";
import FileUpload from "../../components/input/fileInput";
import Button from "../../components/button/Button";
import { groupBy } from "../../global/helpers/groupBy";
import Editor from "../Editor";
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
  | "dropdownmultiple"
  | "texteditor";

export type Field = {
  className: string;
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  errMsg: string;
  readApi: string;
  updateApi: string;
  apiKey?: string;
  createKey?: string;
  createMenuItem?: Field[];
  isForm?: boolean;
  section?: string;
};

export type FieldGroup = {
  title: string;
  sectionKey?: string;
  fields: Field[];
};

type CommonFormProps = {
  groupedFields: FieldGroup[];
  isPopUp?: boolean;
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

function TabForm({
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
  const [editPreviewIndex, setEditPreviewIndex] = useState<number | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  //   tab
  const [activeTab, setActiveTab] = useState(groupedFields[0]?.title || "");

  console.log(formData);
  useEffect(() => {
    if (initialData) {
      const normalized = {
        id: initialData.name, // map ERPNext's "name" to our "id"
        ...initialData,
      };
      setFormData(normalized);

      if (Array.isArray(initialData.items)) {
        const mappedItems = initialData.items.map((item, idx) => ({
          id: (idx + 1).toString(),
          ...item,
        }));
        setPreviewData(mappedItems);
      } else {
        setPreviewData([]);
      }
    }
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

  const handleAddSection = (sectionFields: Field[]) => {
  const errors: Record<string, string> = {};
  sectionFields.forEach((field) => {
    const value = formData[field.id];
    const error = validateField(field, value);
    if (error) errors[field.id] = error;
  });

  setFormErrors(errors);
  if (Object.keys(errors).length > 0) return;

  const entryWithId: TableRowData = {
    id: editPreviewIndex !== null 
      ? (editPreviewIndex + 1).toString() // keep same index id during edit
      : (previewData.length + 1).toString(), // serial for new
    ...formData,
  };

  if (editPreviewIndex !== null) {
    // ✅ update existing row
    setPreviewData((prev) =>
      prev.map((item, idx) => (idx === editPreviewIndex ? entryWithId : item))
    );
    setEditPreviewIndex(null);
  } else {
    // ✅ add new row
    setPreviewData((prev) => [...prev, entryWithId]);
  }

  // clear only this subsection's fields
  const cleared = { ...formData };
  sectionFields.forEach((field) => (cleared[field.id] = ""));
  setFormData(cleared);
  setFormErrors({});

  // focus first field in subsection
  setTimeout(() => {
    const first = sectionFields[0]?.id;
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
      handleAddSection(fields);
    }
  };

  const handleSubmit = () => {
  const fixed = { ...formData };

  // If user is editing an item but clicked Submit directly
  if (editPreviewIndex !== null && itemsSectionFields.length > 0) {
    const updatedItem: TableRowData = {
      id: (editPreviewIndex + 1).toString(),
      ...formData,
    };

    setPreviewData((prev) =>
      prev.map((item, idx) => (idx === editPreviewIndex ? updatedItem : item))
    );

    // also update in memory immediately for payload
    previewData[editPreviewIndex] = updatedItem;

    setEditPreviewIndex(null);
  }

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
    const { name, id, ...dataToUpdate } = cleaned;
    const recordId = id || name;
    if (!recordId) {
      triggerAlert("warning", "Missing record identifier for update.");
      return;
    }
    console.log(dataToUpdate)
    apiCall = apiClient.put(`${api.update}/${recordId}`, {
      ...dataToUpdate,
      items: previewData.map(({ action, ...rest }) => rest), // ✅ updated items
    });
  } else {
    if (multipleEntry) {
      if (previewData.length === 0) {
        triggerAlert("warning", "Please add at least one item before submitting.");
        return;
      }

      const itemGroup = groupedFields.find(
        (g) => g.title.toLowerCase() === "items"
      );
      const itemFieldIds =
        itemGroup?.fields
          .filter((f) => f.section?.toLowerCase() === "items")
          .map((f) => f.id) || [];

      const nonItemData: Record<string, any> = { ...formData };
      itemFieldIds.forEach((id) => delete nonItemData[id]);

      const itemsPayload = previewData.map((item) => {
        const cleanedItem: Record<string, any> = {};
        itemFieldIds.forEach((id) => {
          cleanedItem[id] = item[id];
        });
        return cleanedItem;
      });

      const payload = {
        doctype: formName,
        ...nonItemData,
        items: itemsPayload.map(({ action, ...rest }) => rest),
      };

      apiCall = apiClient.post(api.create, payload);
    } else {
      apiCall = apiClient.post(api.create, {
        doctype: formName,
        ...cleaned,
      });
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

  const itemsSectionFields =
    groupedFields
      .find((g) => g.title.toLowerCase() === "items")
      ?.fields.filter((f) => f.section?.toLowerCase() === "items") || [];

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
            ? "w-full lg:w-[70%] h-[90vh] bg-background text-foreground p-4 rounded-md shadow-md border border-ring/30 flex flex-col"
            : "bg-background min-h-[80vh] text-foreground m-5 lg:my-10 p-4 rounded-md shadow-lg border border-ring/50 flex flex-col"
        }
      >
        {/* Header */}
        <div className="flex justify-between mb-2">
          <h1 className="text-md py-2 text-foreground/90 font-bold">
            {formName} Form
          </h1>
          <ImageButton
            icon="close"
            className="text-foreground hover:text-delete w-max p-2 border border-ring/30 hover:border-delete"
            onClick={() => {
              setFormData({});
              setFormErrors({});
              setPreviewData([]);
              triggerAlert("delete", faildMsg);
              setFormOpen?.(false);
            }}
          />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          {/* Tabs */}
          <div className="flex gap-2 sm:px-4 px-3">
            {groupedFields.map((group) => (
              <button
                key={group.title}
                onClick={() => setActiveTab(group.title)}
                className={`px-2 sm:px-4 py-2 text-sm font-medium rounded-t-md cursor-pointer ${
                  activeTab === group.title
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary-background"
                }`}
              >
                {group.title}
              </button>
            ))}
          </div>

          {/* Active tab fields */}
          {groupedFields
            .filter((group) => group.title === activeTab)
            .map((group) => (
              <div
                key={group.title}
                className="flex flex-col gap-4 border border-ring/30 rounded-lg p-2"
              >
                {group.fields.length > 0 ? (
                  Object.entries(groupBy(group.fields, "section")).map(
                    ([sectionName, sectionFields]) => (
                      <div key={sectionName} className="col-span-full p-4 mb-4">
                        {sectionName.toLowerCase() !== "general" && (
                          <h4 className="font-semibold mb-4 text-lg text-muted-foreground capitalize">
                            {sectionName}
                          </h4>
                        )}

                        <div
                          className={`${
                            sectionName.toLowerCase() === "item"
                              ? "flex flex-col lg:flex-row  pt-2 gap-4"
                              : "grid grid-cols-1 md:grid-cols-2 gap-4"
                          }`}
                        >
                          {sectionFields.map((field) => {
                            const err = formErrors[field.id] || "";
                            const value = formData[field.id] || "";

                            const commonProps = {
                              id: field.id,
                              value,
                              err,
                              onChange: (e: any) =>
                                handleChange(field.id, e.target?.value ?? e),
                              onKeyDown: (e: any) =>
                                handleKeyDown(
                                  e,
                                  field.id,
                                  sectionFields,
                                  group.title
                                ),
                              className: `${field.className} rounded-md`,
                              ref: (el: any) =>
                                (inputRefs.current[field.id] = el),
                            };

                            return (
                              <div key={field.id}>
                                {renderField(field, commonProps, value)}
                              </div>
                            );
                          })}
                        </div>

                        {/* Add button for items */}
                        {
                          multipleEntry &&
                          sectionName.toLowerCase() === "items" && (
                            <div className="flex justify-end mt-2">
                              <Button
                                label="Add"
                                className="bg-create text-create-foreground"
                                onClick={() => handleAddSection(sectionFields)}
                              />
                            </div>
                          )}
                      </div>
                    )
                  )
                ) : (
                  <p className="text-center text-muted-foreground py-10">
                    No fields available
                  </p>
                )}

                {multipleEntry && activeTab.toLowerCase() === "items" && (
                  <div>
                    <div className="mt-5 px-4">
                      <CommonTable
                        head={[
                          ...itemsSectionFields.map((f) => ({
                            key: f.id,
                            label: f.label,
                          })),
                          { key: "action", label: "Action" }, // 👈 Add this
                        ]}
                        body={previewData.map((entry, index) => {
                          const row: TableRowData = {
                            id: (index + 1).toString(),
                          }; // serial number for display
                          itemsSectionFields.forEach((f) => {
                            row[f.id] = entry[f.id];
                          });
                          return row;
                        })}
                        onEdit={(row, index) => {
                          const updated = { ...formData };
                          itemsSectionFields.forEach((f) => {
                            updated[f.id] = row[f.id];
                          });
                          setFormData(updated);
                          setEditPreviewIndex(index);
                        }}
                        onDelete={(index) => {
                          setPreviewData((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                        currentPage={1}
                        rowsPerPage={10}
                        totalCount={previewData.length}
                        onPageChange={() => {}}
                        actionMenu={false}
                      />
                    </div>
                    <div className="flex flex-col gap-2 mt-20 items-end">
                      <div className="grid grid-cols-2 w-full sm:w-[80%] lg:w-[40%] px-5 lg:pr-10">
                        <div className="flex justify-between">
                          <p>Taxable No</p>
                          <p>:</p>
                        </div>
                        <p className="text-right">-</p>
                      </div>
                      <div className="grid grid-cols-2 w-full sm:w-[80%] lg:w-[40%] px-5 lg:pr-10">
                        <div className="flex justify-between">
                          <p>GST</p>
                          <p>:</p>
                        </div>
                        <p className="text-right">-</p>
                      </div>
                      <div className="grid grid-cols-2 w-full sm:w-[80%] lg:w-[40%] px-5 lg:pr-10">
                        <div className="flex justify-between">
                          <p>Round Off</p>
                          <p>:</p>
                        </div>
                        <p className="text-right">-</p>
                      </div>
                      <div className="grid grid-cols-2 w-full sm:w-[80%] lg:w-[40%] px-5 lg:pr-10">
                        <div className="flex justify-between">
                          <p>Grand Total</p>
                          <p>:</p>
                        </div>
                        <p className="text-right">-</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Footer buttons always visible */}
        <div className="flex justify-end gap-5 mt-2 border-t border-ring/30 pt-2">
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

export default TabForm;

export const renderField = (field: Field, commonProps: any, value: any) => {
  switch (field.type) {
    case "textinput":
      return <FloatingInput {...commonProps} label={field.label} type="text" />;
    case "textarea":
      return <TextArea {...commonProps} label={field.label} />;
    case "dropdown":
      return (
        <Dropdown
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
          {...commonProps}
          items={field.options || []}
          label={field.label}
          readApi={field.readApi}
          apiKey={field.apiKey}
        />
      );
    case "dropdownreadmultiple":
      return (
        <DropdownRead
          {...commonProps}
          multiple
          items={field.options || []}
          label={field.label}
          readApi={field.readApi}
          apiKey={field.apiKey}
        />
      );
    case "switch":
      return (
        <Switch
          {...commonProps}
          agreed={!!value}
          label={!!value ? "Active" : "Inactive"}
        />
      );
    case "checkbox":
      return <Checkbox {...commonProps} agreed={!!value} label={field.label} />;
    case "multicheckbox":
      return (
        <MultiCheckbox
          {...commonProps}
          label={field.label}
          options={field.options || []}
        />
      );
    case "password":
      return <Password_Input {...commonProps} label={field.label} />;
    case "date":
      return (
        <DatePicker
          model={value ? new Date(value) : undefined}
          onChange={(d) => commonProps.onChange(d)} // ✅ use handleChange from commonProps
          formatStr="yyyy-MM-dd"
          label={field.label}
        />
      );
    case "file":
      return <FileUpload id={field.id} />;
    case "texteditor":
      return <Editor apiPath="/api/tasks" id={field.id} />;
    default:
      return <FloatingInput {...commonProps} label={field.label} type="text" />;
  }
};
