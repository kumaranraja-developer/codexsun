import { useEffect, useState } from "react";
import FormLayout from "../../components/common/FormLayout";
import type { ApiList, FieldGroup } from "../../components/common/commonform";
import type { Column } from "../../components/common/commontable";
import { getNestedValue } from "../../global/helpers/utils";
import { parseInvoiceConfig, ParsedConfig } from "../../global/helpers/parseInvoiceConfig";

interface TableFormProps {
  jsonPath: string | object;
  formName: string;
  formApi: ApiList;
  fieldPath: string;
  multipleEntry?: boolean;
  popup?:boolean
}

function TableForm({
  formName,
  jsonPath,
  formApi,
  fieldPath,
  multipleEntry = false,
  popup=true
}: TableFormProps) {
  const [groupedFields, setGroupedFields] = useState<FieldGroup[]>([]);
  const [head, setHead] = useState<Column[]>([]);
  const [printableFields, setPrintableFields] = useState<string[]>([]);

  useEffect(() => {
    const invoice = getNestedValue(jsonPath, fieldPath);
    if (!invoice) return;

    const { groupedFields, head, printableFields }: ParsedConfig =
      parseInvoiceConfig(invoice);

    setGroupedFields(groupedFields);
    setHead(head);
    setPrintableFields(printableFields);
  }, [jsonPath, fieldPath]);

  return (
    <div>
      {groupedFields.length > 0 && head.length > 0 && (
        <FormLayout
          groupedFields={groupedFields}
          head={head}
          formApi={formApi}
          printableFields={printableFields}
          multipleEntry={multipleEntry}
          formName={formName}
          popup={popup}
        />
      )}
    </div>
  );
}

export default TableForm;
