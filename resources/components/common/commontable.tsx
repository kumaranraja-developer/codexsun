import { useState, useMemo } from "react";
import ImageButton from "../button/ImageBtn";
import ActionMenu from "./ActionMenu";
import Warning from "../alert/Warning";
import apiClient from "../../../resources/global/api/apiClients";
import React from "react";
import StatusBadge from "../alert/StatusBadge";

export interface TableRowData {
  [key: string]: string | number;
  id: string;
}

export interface Column {
  key: string;
  label: string;
}

interface CommonTableProps {
  head: Column[];
  body: TableRowData[];
  onEdit: (row: TableRowData, index: number) => void;
  onCreate?: () => void;
  currentPage: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onDelete?: (index: number) => void;
  onDeleteSelected?: (ids: string[]) => void;
  onCellClick?: (key: string, value: string) => void;
  filterOnColumnClick?: boolean;
  api?: ApiList;
  actionMenu?: boolean;
}
export interface ApiList {
  create: string;
  read: string;
  update: string;
  delete: string;
}

function CommonTable({
  head,
  body,
  onEdit,
  onDelete,
  onDeleteSelected,
  onCellClick,
  filterOnColumnClick,
  api,
  actionMenu = true,
}: CommonTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [warningOpen, setWarningOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | {
    type: "edit" | "delete";
    ids: string[];
  }>(null);

  const sortedBody = useMemo(() => {
    if (!sortColumn) return body;

    return [...body].sort((a, b) => {
      const aRaw = a[sortColumn];
      const bRaw = b[sortColumn];

      const aVal = typeof aRaw === "string" ? aRaw : "";
      const bVal = typeof bRaw === "string" ? bRaw : "";

      const isNumeric = !isNaN(Number(aVal)) && !isNaN(Number(bVal));

      if (isNumeric) {
        return sortDirection === "asc"
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }, [body, sortColumn, sortDirection]);

  const getRowById = (id: string) => body.find((r) => r.id === id);

  const handleDeleteSelected = () => {
    if (selectedIds.length === 1) {
      const index = body.findIndex((r) => r.id === selectedIds[0]);
      onDelete?.(index);
      setSelectedIds([]);
    } else {
      setPendingAction({ type: "delete", ids: selectedIds });
      setWarningOpen(true);
    }
    setActionMenuVisible(false);
  };

  const handleWarningConfirm = async () => {
    if (!pendingAction) return;

    if (pendingAction.type === "delete" && api?.delete) {
      try {
        await Promise.all(
          pendingAction.ids.map((id) =>
            apiClient.delete(`${api.delete}/${encodeURIComponent(id)}`)
          )
        );
        onDeleteSelected?.(pendingAction.ids);
        console.log("✅ Deletion successful");
      } catch (err) {
        console.error("❌ Failed to delete one or more rows", err);
      }
    } else if (pendingAction.type === "edit") {
      if (pendingAction.ids.length > 1) {
        console.warn("Multi-row editing is disabled.");
        setWarningOpen(false);
        setPendingAction(null);
        return;
      }

      const row = getRowById(pendingAction.ids[0]);
      if (row) {
        onEdit(row, -1);
      }
    }

    setSelectedIds([]);
    setPendingAction(null);
    setWarningOpen(false);
  };

  const handleWarningCancel = () => {
    setWarningOpen(false);
    setPendingAction(null);
  };

  const getWarningMessage = () => {
    if (!pendingAction) return "";
    const count = pendingAction.ids.length;

    if (pendingAction.type === "delete") {
      return count === 1
        ? "Are you sure you want to delete this row?"
        : `Are you sure you want to delete ${count} rows?`;
    }

    if (pendingAction.type === "edit") {
      return `You are editing this row. Proceed?`;
    }

    return "";
  };

  return (
    <div>
      {actionMenu && (
        <ActionMenu
          className="absolute top-9 lg:top-6 border-ring/40 right-0 lg:mt-3 mr-3"
          onClick={() => setActionMenuVisible(!actionMenuVisible)}
          isVisible={actionMenuVisible}
          menuItems={[
            {
              label: "Delete",
              icon: "delete" as const, // ✅ cast to literal
              onClick: handleDeleteSelected,
            },
          ]}
        />
      )}

      <div className="overflow-x-auto border border-ring/20 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-thead-background text-thead-foreground">
            <tr className="">
              {head.map((h, i) => {
                const key = h.key;

                if (key === "id") {
                  const allSelected = sortedBody.every((row) =>
                    selectedIds.includes(row.id)
                  );
                  return (
                    <th
                      key={i}
                      className="border-b border-ring/30 border-r px-4 text-center group whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="accent-primary border border-ring/30 w-4 h-4 cursor-pointer shrink-0"
                          checked={allSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(sortedBody.map((row) => row.id));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                        />
                        <span
                          className="text-md uppercase tracking-wide cursor-pointer"
                          onClick={() => {
                            setSortColumn(key);
                            setSortDirection((prev) =>
                              sortColumn === key && prev === "asc"
                                ? "desc"
                                : "asc"
                            );
                          }}
                        >
                          {h.label}
                        </span>
                        <ImageButton
                          onClick={() => {
                            setSortColumn(key);
                            setSortDirection((prev) =>
                              sortColumn === key && prev === "asc"
                                ? "desc"
                                : "asc"
                            );
                          }}
                          className="text-sm"
                          icon={
                            sortColumn === key
                              ? sortDirection === "asc"
                                ? "asc"
                                : "desc"
                              : "sort"
                          }
                        />
                      </div>
                    </th>
                  );
                }

                if (key === "action") {
                  return (
                    <th
                      key={i}
                      className="border-b text-md border-ring/30 px-4 text-start"
                    >
                      {h.label}
                    </th>
                  );
                }

                return (
                  <th
                    key={i}
                    className="border-b border-r border-ring/30 px-4 text-center group whitespace-nowrap"
                  >
                    <div className="flex py-2 items-center gap-2">
                      <span
                        className="cursor-pointer text-md capitalize"
                        onClick={() => {
                          setSortColumn(key);
                          setSortDirection((prev) =>
                            sortColumn === key && prev === "asc"
                              ? "desc"
                              : "asc"
                          );
                        }}
                      >
                        {h.label}
                      </span>
                      <ImageButton
                        onClick={() => {
                          setSortColumn(key);
                          setSortDirection((prev) =>
                            sortColumn === key && prev === "asc"
                              ? "desc"
                              : "asc"
                          );
                        }}
                        className="text-sm"
                        icon={
                          sortColumn === key
                            ? sortDirection === "asc"
                              ? "asc"
                              : "desc"
                            : "sort"
                        }
                      />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedBody.length === 0 ? (
              <tr>
                <td
                  colSpan={head.length}
                  className="text-center py-3 text-muted-foreground"
                >
                  No record available
                </td>
              </tr>
            ) : (
              sortedBody.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-ring/30 hover:bg-thead-background/40"
                >
                  {head.map((column, colIndex) => {
                    const key = column.key;
                    const cellValue = item[key] || "";

                    if (key === "id") {
                      return (
                        <td
                          key={colIndex}
                          className="px-4 py-1 border-r border-ring/30"
                        >
                          <label className="inline-flex items-center gap-2 font-semibold">
                            <input
                              type="checkbox"
                              className="accent-primary border border-ring/10 cursor-pointer w-4 h-4 shrink-0"
                              checked={selectedIds.includes(item.id)}
                              onChange={() =>
                                setSelectedIds((prev) =>
                                  prev.includes(item.id)
                                    ? prev.filter((id) => id !== item.id)
                                    : [...prev, item.id]
                                )
                              }
                            />
                            {cellValue}
                          </label>
                        </td>
                      );
                    }

                    if (key === "is_active" || key === "active") {
                      return (
                        <td
                          key={colIndex}
                          className="px-4 py-2 cursor-pointer border-r border-ring/30"
                          onClick={() => {
                            if (filterOnColumnClick && onCellClick) {
                              onCellClick(key, String(cellValue));
                            }
                          }}
                          title={`Click to filter ${key} = "${cellValue}"`}
                        >
                          <StatusBadge
                            active={cellValue === "true" || cellValue === 1}
                          />
                        </td>
                      );
                    }

                    if (key === "action") {
                      return (
                        <td key={colIndex} className="px-4 py-1">
                          <div className="flex gap-2">
                            <ImageButton
                              icon="edit"
                              className="bg-update/70 text-update-foreground p-2"
                              onClick={() => onEdit(item, rowIndex)}
                            />

                            <ImageButton
                              icon="delete"
                              className="bg-delete/70 text-delete-foreground p-2"
                              onClick={() => {
                                setPendingAction({
                                  type: "delete",
                                  ids: [item.id],
                                });
                                setWarningOpen(true);
                              }}
                            />
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={colIndex}
                        className="px-4 py-2 cursor-pointer border-r border-ring/30"
                        // onClick={() => onCellClick?.(key, String(cellValue))}
                        onClick={() => {
                          if (filterOnColumnClick && onCellClick) {
                            onCellClick(key, String(cellValue));
                          }
                        }}
                        title={`Click to filter ${key} = "${cellValue}"`}
                      >
                        <div className="line-clamp-3">{cellValue}</div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {warningOpen && (
        <Warning
          message={getWarningMessage()}
          onConfirm={handleWarningConfirm}
          onClose={handleWarningCancel}
          title="Confirmation"
        />
      )}
    </div>
  );
}

export default CommonTable;
