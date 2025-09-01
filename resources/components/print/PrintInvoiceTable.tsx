interface PrintInvoiceProps {
  head: string[];
  body: string[][];
  alignments?: ("left" | "center" | "right")[];
  totalColumns: string[];
  pageRows: string[][];
  itemsPerPage: number;
  shouldShowTotal: boolean;
  totals: Record<string, number>;
  isLastPage: boolean;
  carriedForward?: Record<string, number> | null;
}

export const columnWidths: Record<string, string> = {
  "S.No": "w-[10px]",
  HSN: "w-[50px]",
  Qty: "w-[50px]",
  Rate: "w-[50px]",
  Tax: "w-[20px]",
  Amount: "w-[60px]",
  "Sub Total": "w-[75px]",
  CGST: "w-[53px]",
  SGST: "w-[53px]",
  "Item Name": "w-auto",
};
export const formatAmount = (value: any) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

function PrintInvoiceTable({
  head,
  pageRows,
  alignments,
  itemsPerPage,
  shouldShowTotal,
  totalColumns,
  totals,
  isLastPage,
  carriedForward,
}: PrintInvoiceProps) {
  return (
    <div>
      <table className="min-w-full table-fixed border-ring">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                className={`border border-ring first:border-l-0 last:border-r-0 px-2 py-1 text-center font-semibold whitespace-nowrap ${columnWidths[h] || "w-auto"}`}
              >
                {h}
              </th>
            ))}
            {shouldShowTotal && (
              <th className="border border-ring  px-2 py-1 text-center font-semibold w-[120px]">
                Total
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {/* ✅ Show carried forward row if available */}
          {carriedForward && (
            <tr className="font-bold">
              {head.map((col, i) => {
                const align = alignments?.[i] || "center";
                const isTotalCol = carriedForward[col] !== undefined;

                const firstTotalIndex = head.findIndex((h) =>
                  totalColumns.includes(h)
                );

                if (i === firstTotalIndex - 1) {
                  return (
                    <td
                      key={i}
                      className="px-2 py-1 text-right font-bold"
                      colSpan={1}
                    >
                      Carried Forward
                    </td>
                  );
                }

                if (isTotalCol) {
                  return (
                    <td
                      key={i}
                      className={`px-0.5 py-1 text-${align} border-x first:border-l-0 last:border-r-0 border-ring`}
                    >
                      {/* {carriedForward[col]} */}
                      {formatAmount(carriedForward[col])}
                    </td>
                  );
                }

                return (
                  <td
                    className="border-x first:border-l-0 last:border-r-0 border-ring"
                    key={i}
                  ></td>
                );
              })}
              {shouldShowTotal && <td></td>}
            </tr>
          )}

          {/* Normal rows */}
          {pageRows.length > 0 ? (
            <>
              {pageRows.map((row, i) => {
                // let requiredLines = 4;

                return (
                  <tr
                    key={i}
                    style={{ height: `38px` }}
                    className="align-top "
                  >
                    {head.map((h, idx) => {
                      const align = alignments?.[idx] || "center";
                      return (
                       <td
  key={idx}
  className={`border-x first:border-l-0 last:border-r-0 border-ring px-0.5 py-0 leading-tight text-${align} ${columnWidths[h] || "w-auto"}`}
>
  {h === "Item Name" ? (
    <div className="line-clamp-3">
      {row[idx]}
    </div>
  ) : h === "Sub Total" ? (
    formatAmount(row[idx])
  ) : (
    row[idx] || ""
  )}
</td>


                      );
                    })}
                    {shouldShowTotal && (
                      <td className="border first:border-l-0 last:border-r-0 px-1 py-0 leading-tight text-right w-[120px]">
                        {formatAmount(row[row.length - 1])}
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Empty filler rows */}
              {Array.from({
                length: Math.max(0, itemsPerPage - pageRows.length),
              }).map((_, idx) => (
                <tr key={`empty-${idx}`}>
                  {head.map((h, i) => (
                    <td
                      key={i}
                      className={`border-x border-ring first:border-l-0 last:border-r-0 px-1 py-0 leading-tight text-center ${columnWidths[h] || "w-auto"}`}
                      style={{ height: "30px" }}
                    >
                      &nbsp;
                    </td>
                  ))}
                  {shouldShowTotal && (
                    <td
                      className="border first:border-l-0 last:border-r-0 px-1 py-0 leading-tight text-right w-[120px]"
                      style={{ height: "30px" }}
                    >
                      &nbsp;
                    </td>
                  )}
                </tr>
              ))}
            </>
          ) : (
            // No items at all → blank page
            Array.from({ length: itemsPerPage }).map((_, idx) => (
              <tr key={`empty-only-${idx}`} className="h-[30px]">
                {head.map((h, i) => (
                  <td
                    key={i}
                    className={`border-x border-ring first:border-l-0 last:border-r-0 px-1 py-0 leading-tight text-center ${columnWidths[h] || "w-auto"}`}
                  >
                    &nbsp;
                  </td>
                ))}
                {shouldShowTotal && (
                  <td className="border px-1 py-0 leading-tight text-right w-[120px]">
                    &nbsp;
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>

        <tfoot className="text-center">
          {totalColumns.length > 0 && (
            <tr className="font-bold border-y border-ring ">
              {head.map((col, i) => {
                const align = alignments?.[i] || "center";
                const isTotalCol = totals[col] !== undefined;

                const firstTotalIndex = head.findIndex((h) =>
                  totalColumns.includes(h)
                );

                // ✅ detect Qty / Quantity (case-insensitive)
                const isQty =
                  col.toLowerCase() === "qty" ||
                  col.toLowerCase() === "quantity";

                if (i === firstTotalIndex - 1) {
                  return (
                    <td
                      key={i}
                      className="px-2 py-1 text-right font-bold"
                      colSpan={1}
                    >
                      {isLastPage ? "Total" : "Total"}
                    </td>
                  );
                }

                if (isTotalCol) {
                  return (
                    <td
                      key={i}
                      className={`py-1 px-0.5 text-${align} border-x last:border-r-0 border-ring`}
                    >
                      {isQty ? totals[col] : formatAmount(totals[col])}
                    </td>
                  );
                }

                return <td key={i}></td>;
              })}
              {shouldShowTotal && <td></td>}
            </tr>
          )}
          {!isLastPage && (
            <div className="absolute right-0 pr-6 pt-2 text-sm">
              to be Continue...
            </div>
          )}
        </tfoot>
      </table>
    </div>
  );
}

export default PrintInvoiceTable;
