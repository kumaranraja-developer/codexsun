import ButtonDropdown from "../button/ButtonDropdown";
import ImageButton from "../button/ImageBtn";
import CommonTable, {
  type ApiList,
  type Column,
  type TableRowData,
} from "./commontable";
import Filter from "./Filter";
import Drawer from "../drawer/Drawer";
import { exportToCSV } from "../external/ExportToCSV";
import AnimateButton from "../button/animatebutton";
import DropdownRead from "../input/dropdown-read";
import Pagination from "../../../resources/components/pagination/pagination";
import { useEffect, useMemo, useRef, useState } from "react";
import CommonForm, { type FieldGroup } from "./commonform";
import { useReactToPrint } from "react-to-print";
import Print from "../../UIBlocks/printformat/Print";
import apiClient from "../../../resources/global/api/apiClients";
import Button from "../../../resources/components/button/Button";
import Tooltip from "../tooltip/tooltip";
import TabForm from "../../UIBlocks/form/TabForm";
type FormLayoutProps = {
  groupedFields: FieldGroup[];
  head: Column[];
  formApi: ApiList;
  printableFields: string[];
  data?: any[];
  multipleEntry: boolean;
  formName: string;
  popup?: boolean;
};

function FormLayout({
  groupedFields,
  head,
  formApi,
  printableFields,
  multipleEntry,
  formName,
  popup,
}: FormLayoutProps) {
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Get list of companies
        const listRes = await apiClient.get(formApi.read);
        const companies = listRes.data || [];

        // Step 2: For each company, fetch detailed data
        // const detailedData = await Promise.all(
        //   companies.map(async (company: any) => {
        //     const name = encodeURIComponent(company.name);
        //     const url = `${formApi.read}/${name}`;
        //     try {
        //       const detailRes = await apiClient.get(url);
        //       console.log(detailRes.data.data)
        //       return detailRes.data.data || null; // your detailed company object
        //     } catch (err) {
        //       console.warn(
        //         `❌ Failed to fetch details for ${company.name}`,
        //         err
        //       );
        //       return null;
        //     }
        //   })
        // );

        // Step 3: Convert to table rows
        const rows: TableRowData[] = companies
          .filter(Boolean)
          .map((entry: any) => {
            const row: TableRowData = {
              id: entry.name || `row-${Math.random()}`,
            };

            head.forEach((h) => {
              const key = h.key;
              const value = entry[key];
              row[key] =
                typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value ?? "");
            });

            return row;
          });

        setTableData(rows);
      } catch (err) {
        console.error("❌ Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [formApi.read, head]);

  const [tableData, setTableData] = useState<TableRowData[]>([]);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    head.map((h) => h.key)
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const filteredData = useMemo(() => {
    return tableData.filter((row) =>
      head.every((h) => {
        const key = h.key.toLowerCase();
        if (!filters[key] || key === "action") return true;
        return String(row[key] ?? "")
          .toLowerCase()
          .includes(filters[key].toLowerCase());
      })
    );
  }, [filters, tableData]);

  const handleCreate = () => {
    setEditData({});
    setEditId(null); // updated
    setFormOpen(true);
  };

  const handleFormSubmit = (formData: any[] | any) => {
    const updated = [...tableData];

    if (Array.isArray(formData)) {
      formData.forEach((entry) => {
        const index = updated.findIndex((d) => d.id === entry.id);
        if (index !== -1) {
          updated[index] = entry; // update with new value
        } else {
          updated.push(entry); // add if new
        }
      });
    } else {
      if (editId !== null) {
        // Editing single row
        const index = updated.findIndex((d) => d.id === editId);
        if (index !== -1) {
          updated[index] = { ...updated[index], ...formData };
        }
      } else {
        updated.push(formData);
      }
    }

    setTableData(updated);
    setFormOpen(false);
    setEditId(null);
    setEditData({});
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage); // ✅ Controls what's shown
  }, [filteredData, currentPage, rowsPerPage]);

  const handleEdit = async (rowData: any) => {
    setEditId(rowData.id);

    try {
      const url = `${formApi.read}/${encodeURIComponent(rowData.id)}`;
      const res = await apiClient.get(url);
      const detail = res.data;

      setEditData(detail); // ✅ load full record into form
      setFormOpen(true);
    } catch (err) {
      console.error(`❌ Failed to fetch details for ${rowData.id}`, err);
    }
  };

  const handleDelete = (index: number) => {
    const updated = [...tableData];
    updated.splice(index, 1);
    setTableData(updated);
  };
  const handleDeleteSelected = (ids: string[]) => {
    const updated = tableData.filter((row) => !ids.includes(row.id));
    setTableData(updated);
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "receipt",
  });
  const [printColumn] = useState<string[]>(
    printableFields.map((field: any) => field.key)
  );

  const printHead = useMemo(() => {
    return printableFields.map((field: any) => field.label);
  }, [printableFields]);

  const printBody = useMemo(() => {
    return paginatedData.map((row) =>
      printColumn.map((key) => String(row[key] ?? ""))
    );
  }, [paginatedData, printColumn]);

  return (
    <div className="">
      {/* Table header items */}
      <div ref={printRef} className="hidden print:block p-5">
        <Print
          head={printHead}
          body={printBody}
          client={{
            name: "ABC CLIENTS INDIA LTD",
            address: {
              address1: "12, Park Street",
              address2: "Kolkata, West Bengal",
              address3: "9876543210",
              address4: "29ABCDE1234F1Z5",
            },
          }}
        />
      </div>
      {!formOpen && (
        <div className="flex justify-end pr-14 gap-2">
          <div className="flex flex-nowrap items-center gap-2">
            <div className="overflow-x-scroll gap-5 flex w-2xl scrollbar-hide">
              {Object.entries(filters)
                .filter(([key, value]) => value && key !== "action")
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-1 whitespace-nowrap px-2 text-xs rounded-full bg-muted text-muted-foreground border border-ring"
                  >
                    <span className="capitalize">{key}</span>:{" "}
                    <span>{value}</span>
                    <ImageButton
                      icon="close"
                      onClick={() =>
                        setFilters((prev) => {
                          const updated = { ...prev };
                          delete updated[key];
                          return updated;
                        })
                      }
                      className="text-xs p-2 font-bold text-delete hover:text-destructive"
                    />
                  </div>
                ))}
            </div>
            <Tooltip content={"Filter"}>
              <ImageButton
                className="p-2"
                icon="filter"
                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
              />
            </Tooltip>
          </div>

          <div className="flex gap-2 items-center">
            <Tooltip content={"Column hide"}>
              <ButtonDropdown
                icon="column"
                columns={head
                  .filter((h) => h.key !== "id")
                  .map((h) => ({ key: h.key, label: h.label }))}
                visibleColumns={visibleColumns}
                onChange={setVisibleColumns}
                excludedColumns={["id"]}
                className="block m-auto p-2"
              />
            </Tooltip>
            <Tooltip content={"Export CSV"}>
              <ImageButton
                icon="export"
                className="p-2"
                onClick={() =>
                  exportToCSV(
                    filteredData,
                    head.map((h) => h.key),
                    `purchase.csv`
                  )
                }
              />
            </Tooltip>
            <Tooltip content={"Print"}>
              <ImageButton icon="print" className="p-2" onClick={handlePrint} />
            </Tooltip>

            <AnimateButton
              label="Create"
              className="bg-create"
              mode="create"
              onClick={handleCreate}
            />
          </div>
        </div>
      )}

      {/* form for create and edit */}
      {formOpen && (
        <div className="px-5 overflow-auto">
          <TabForm
            groupedFields={groupedFields}
            isPopUp={popup}
            formOpen={formOpen}
            setFormOpen={setFormOpen}
            formName={formName}
            successMsg="Form submitted successfully"
            faildMsg="Form submission failed"
            initialData={editData}
            onSubmit={handleFormSubmit}
            multipleEntry={multipleEntry}
            api={formApi}
            mode={editId ? "edit" : "create"} // ✅ dynamic mode
          />
        </div>
      )}

      {!formOpen && (
        <div className="mt-2 pr-2">
          <CommonTable
            head={head.filter((h) => visibleColumns.includes(h.key))}
            body={paginatedData}
            onEdit={handleEdit}
            onCreate={handleCreate}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalCount={filteredData.length}
            onPageChange={setCurrentPage}
            onDelete={handleDelete}
            onDeleteSelected={handleDeleteSelected}
            onCellClick={(key, value) => {
              setFilters((prev) => ({ ...prev, [key]: value }));
              setFilterDrawerOpen(true);
            }}
            filterOnColumnClick={filterDrawerOpen}
            api={formApi}
          />
        </div>
      )}
      {/* Purchase Table */}

      {!formOpen && (
        <div className="mt-4 flex flex-col gap-3 pr-[5%] md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <label htmlFor="rows-per-page" className="whitespace-nowrap">
              Records per page:
            </label>
            <DropdownRead
              id="page"
              items={["20", "50", "100", "200"]}
              value={String(rowsPerPage)}
              err=""
              className="w-30"
              onChange={(value) => {
                const selected = Array.isArray(value) ? value[0] : value;
                const parsed = parseInt(selected, 10);
                if (!isNaN(parsed)) {
                  setRowsPerPage(parsed);
                  setCurrentPage(1); // ✅ reset page
                }
              }}
              placeholder=""
              label=""
            />
          </div>

          <p>
            {Math.min((currentPage - 1) * rowsPerPage + 1, filteredData.length)}
            –{Math.min(currentPage * rowsPerPage, filteredData.length)} of{" "}
            {filteredData.length} products
          </p>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.length / rowsPerPage)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {!formOpen && (
        <Drawer
          isOpen={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          position="bottom"
          title="Filters"
        >
          <div className="overflow-scroll">
            <Filter
              head={head
                .filter((h) => visibleColumns.includes(h.key))
                .map((h) => h.key)}
              filters={filters}
              onFilterChange={(key, value) =>
                setFilters((prev) => ({ ...prev, [key]: value }))
              }
            />
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <Button
              label="Clear"
              className="text-delete-foreground bg-delete"
              onClick={() => {
                setFilters({});
                setFilterDrawerOpen(false);
              }}
              children={undefined}
            />

            <Button
              label="Apply changes"
              className="bg-update text-update-foreground"
              onClick={() => setFilterDrawerOpen(false)}
              children={undefined}
            />
          </div>
        </Drawer>
      )}
      {/* number of page and pagination */}

      {/* filter drawer */}
    </div>
  );
}

export default FormLayout;
