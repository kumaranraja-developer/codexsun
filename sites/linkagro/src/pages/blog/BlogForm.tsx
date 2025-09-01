import { useEffect, useState } from "react";
import FormLayout from "../../../../../resources/components/common/FormLayout";
import type {
  ApiList,
  Field,
  FieldGroup,
} from "../../../../../resources/components/common/commonform";
import apiClient from "../../../../../resources/global/api/apiClients";
import { Column } from "../../../../../resources/components/common/commontable"; // Adjust path if needed

interface BlogFormProps {
  jsonPath: string;
  crudApi: string;
}
function BlogForm({ jsonPath, crudApi }: BlogFormProps) {
  const [groupedFields, setGroupedFields] = useState<FieldGroup[]>([]);
  const [head, setHead] = useState<Column[]>([]);
  const [printableFields, setPrintableFields] = useState<string[]>([]);

  const [formApi] = useState<ApiList>({
    create: crudApi,
    read: crudApi,
    update: crudApi,
    delete: crudApi,
  });

  useEffect(() => {
    const fetchInvoiceConfig = async () => {
      try {
        // option:1
        const res = await fetch(
          "http://localhost:4001/api/config/Blog.json/blog.blogs"
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        } else {
          console.log("done");
        }
        // 🔁 Change this to `sales` if needed
        const invoice = await res.json();
        // console.log(invoice);
        console.log(invoice.details); // Logs the details object

        if (!invoice) return;

        const head: Column[] = Object.values(invoice)
          .flatMap((section: any) => section.fields)
          .filter((field: any) => field.inTable);

        const groupedFields: FieldGroup[] = Object.entries(invoice).map(
          ([sectionKey, section]: [string, any]) => ({
            title: section.title || sectionKey,
            sectionKey,
            fields: section.fields
              .filter(
                (field: any) =>
                  field.key !== "action" &&
                  field.key !== "id" &&
                  field.isForm === true
              )
              .map((field: any) => ({
                id: field.key,
                label: field.label,
                type: (field.type || "textinput") as Field["type"],
                className: "w-full",
                errMsg: `Enter ${field.label}`,
                ...(field.type?.includes("dropdown") && field.options
                  ? { options: field.options }
                  : {}),
                readApi: field.readApi,
                updateApi: field.updateApi,
                apiKey: field.apiKey,
                createKey: field.createKey,
              })),
          })
        );

        const printableFields: string[] = Object.values(invoice).flatMap(
          (section: any) =>
            section.fields.filter((field: any) => field.isPrint === true)
        );

        setGroupedFields(groupedFields);
        setHead(head);
        setPrintableFields(printableFields);
      } catch (err) {
        console.error("Failed to load invoice config:", err);
      }
    };

    fetchInvoiceConfig();
  }, []);

  return (
    <div className="mt-20">
      {groupedFields.length > 0 && head.length > 0 && (
        <FormLayout
          groupedFields={groupedFields}
          head={head}
          formApi={formApi}
          printableFields={printableFields}
          multipleEntry={false}
          formName="Payment"
        />
      )}
    </div>
  );
}

export default BlogForm;
