// utils/parseInvoiceConfig.ts
import type { Field, FieldGroup } from "../../components/common/commonform";
import type { Column } from "../../components/common/commontable";

export interface ParsedConfig {
  groupedFields: FieldGroup[];
  head: Column[];
  printableFields: string[];
}

export function parseInvoiceConfig(invoice: any): ParsedConfig {
  if (!invoice) return { groupedFields: [], head: [], printableFields: [] };

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
            field.key !== "key" &&
            field.isForm === true
        )
        .map((field: any) => ({
          id: field.key,
          label: field.label,
          type: (field.type || "textinput") as Field["type"],
          className: "w-full",
          errMsg: `Enter ${field.label}`,
          section: field.section || "General", // ✅ add this line
          readApi: field.readApi,
          updateApi: field.updateApi,
          apiKey: field.apiKey,
          createKey: field.createKey,
          ...(field.createMenuItem
            ? {
                createMenuItem: field.createMenuItem.map((f: any) => ({
                  id: f.key,
                  label: f.label,
                  type: (f.type || "textinput") as Field["type"],
                  className: "w-full",
                  errMsg: `Enter ${f.label}`,
                  readApi: f.readApi,
                  updateApi: f.updateApi,
                  apiKey: f.apiKey,
                  createKey: f.createKey,
                })),
              }
            : {}),
        })),
    })
  );

  const printableFields: string[] = Object.values(invoice).flatMap(
    (section: any) =>
      section.fields.filter((field: any) => field.isPrint === true)
  );

  return { groupedFields, head, printableFields };
}
