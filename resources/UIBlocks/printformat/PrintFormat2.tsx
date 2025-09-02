import { JSX, useState } from "react";
import NumberToWords from "../../global/helpers/NumberToWords";
import PrintHeader from "../../components/print/PrintHeader";
import PrintFooter from "../../components/print/PrintFooter";
import PrintInvoiceTable from "../../components/print/PrintInvoiceTable";
export interface PrintInvoiceInfo {
  invoiceNo: string;
  invoiceDate: string;
  transportMode: string;
  vehicleNo: string;
  supplyDateTime: string;
  placeOfSupply: string;
  IRN?: string;
}
export interface PrintBank {
  accountNo: string;
  IFSC: string;
  Bank: string;
  Branch: string;
}
export interface PrintCustomerAddress {
  address1: string;
  address2: string;
  address3: string;
  GSTIN: string;
}

interface PrintProps {
  head: string[];
  body: string[][];
  alignments?: ("left" | "center" | "right")[];
  client: {
    name: string;
    address: PrintAddress;
    phone: number;
    email: string;
    gstinNo: string;
  };
  bank: PrintBank;
  logo: string;
  customerName: string;
  BillAddress: PrintCustomerAddress;
  ShipingAddress: PrintCustomerAddress;
  totalColumns?: string[];
  invoiceInfo: PrintInvoiceInfo;
  IRNQR:string
  BankQR:string
}
export interface PrintAddress {
  address1: string;
  address2: string;
}

// Pagination setup with subtotals
interface PageData {
  rows: string[][];
  subtotal: Record<string, number>;
}

function PrintFormat2({
  head,
  body,
  alignments,
  client,
  bank,
  logo,
  customerName,
  BillAddress,
  ShipingAddress,
  totalColumns = [],
  invoiceInfo,
  IRNQR,
  BankQR
}: PrintProps) {
  const quantityIndex = head.findIndex((h) =>
    h.toLowerCase().includes("quantity")
  );
  const priceIndex = head.findIndex((h) => h.toLowerCase().includes("price"));
  const amountIndex = head.findIndex((h) => h.toLowerCase().includes("amount"));
  const totalIndex = head.findIndex((h) => h.toLowerCase() === "total");
  const hasTotalColumn = totalIndex !== -1;

  const day = new Date();
  const today = `${String(day.getDate()).padStart(2, "0")}-${String(day.getMonth() + 1).padStart(2, "0")}-${day.getFullYear()}`;
  const hasQuantity = quantityIndex !== -1;
  const hasAmount = amountIndex !== -1;
  const hasPrice = priceIndex !== -1;
  const shouldShowTotal = hasQuantity && (hasAmount || hasPrice);

  const computedBody = body.map((row) => {
    let rowTotal = 0;
    if (shouldShowTotal) {
      if (hasAmount) {
        rowTotal =
          (parseFloat(row[quantityIndex]) || 0) *
          (parseFloat(row[amountIndex]) || 0);
      } else if (hasPrice) {
        rowTotal =
          (parseFloat(row[quantityIndex]) || 0) *
          (parseFloat(row[priceIndex]) || 0);
      }
    }

    const newRow = [...row];
    if (shouldShowTotal) {
      newRow.push(rowTotal.toFixed(2));
    }
    return newRow;
  });

  const totalQuantity = computedBody.reduce((sum, row) => {
    const val = quantityIndex !== -1 ? parseFloat(row[quantityIndex]) : 0;
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const totalAmount = computedBody.reduce((sum, row) => {
    const val = parseFloat(row[hasTotalColumn ? totalIndex : row.length - 1]);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const cgst = totalAmount * 0.09;
  const sgst = totalAmount * 0.09;
  const totalGST = cgst + sgst;
  const grandTotal = totalAmount + cgst + sgst;
  const roundedTotal = Math.round(grandTotal);
  const roundOff = +(roundedTotal - grandTotal).toFixed(2);
  const grandTotalInWords =
    NumberToWords(roundedTotal).replace(/\b\w/g, (l: string) => l.toUpperCase()) +
    " Rupees Only";

  const totals: Record<string, number> = {};

  totalColumns.forEach((col) => {
    const colIndex = head.indexOf(col);
    if (colIndex !== -1) {
      totals[col] = body.reduce((sum, row) => {
        const val = Number(row[colIndex]);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
    }
  });

  // Pagination setup

  // Pagination setup
  const pages: PageData[] = [];

  if (computedBody.length <= 8) {
    // ✅ If total items <= 12 → only 12 items on first page
    const pageRows = computedBody.slice(0, 8);
    const pageSubtotal: Record<string, number> = {};
    totalColumns.forEach((col) => {
      const colIndex = head.indexOf(col);
      if (colIndex !== -1) {
        pageSubtotal[col] = pageRows.reduce((sum, row) => {
          const val = Number(row[colIndex]);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);
      }
    });
    pages.push({ rows: pageRows, subtotal: pageSubtotal });
  } else {
    let i = 0;

    // ✅ First page → up to 23 items if total > 12
    const firstPageSize = Math.min(18, computedBody.length);
    const firstPageRows = computedBody.slice(i, i + firstPageSize);
    const firstSubtotal: Record<string, number> = {};
    totalColumns.forEach((col) => {
      const colIndex = head.indexOf(col);
      firstSubtotal[col] = firstPageRows.reduce(
        (sum, row) => sum + (parseFloat(row[colIndex]) || 0),
        0
      );
    });
    pages.push({ rows: firstPageRows, subtotal: firstSubtotal });
    i += firstPageSize;

    // Subsequent pages
    while (i < computedBody.length) {
      const remaining = computedBody.length - i;

      if (remaining <= 8) {
        const lastRows = computedBody.slice(i);
        const lastSubtotal: Record<string, number> = {};
        totalColumns.forEach((col) => {
          const colIndex = head.indexOf(col);
          lastSubtotal[col] = lastRows.reduce(
            (sum, row) => sum + (parseFloat(row[colIndex]) || 0),
            0
          );
        });
        pages.push({ rows: lastRows, subtotal: lastSubtotal });
        i = computedBody.length;
      } else {
        const midRows = computedBody.slice(i, i + 18);
        const midSubtotal: Record<string, number> = {};
        totalColumns.forEach((col) => {
          const colIndex = head.indexOf(col);
          midSubtotal[col] = midRows.reduce(
            (sum, row) => sum + (parseFloat(row[colIndex]) || 0),
            0
          );
        });
        pages.push({ rows: midRows, subtotal: midSubtotal });
        i += 18;
      }
    }
  }

  // ✅ If last page has more than 12 rows, add empty footer page
  const lastPage = pages[pages.length - 1];
  if (lastPage.rows.length > 8) {
    pages.push({ rows: [], subtotal: {} });
  }
  return (
    <div className="w-full">
      {pages.map((page, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;
        const isEmptyFooterPage = page.rows.length === 0;
        const carriedForward =
          pageIndex > 0 ? pages[pageIndex - 1].subtotal : null;

        return (
          <div
            key={pageIndex}
            className={`page border border-b-0 border-ring w-full ${
              pageIndex > 0 ? " mt-6" : ""
            } text-[10px]`}
          >
            <PrintHeader
              client={client}
              logo={logo}
              invoiceInfo={invoiceInfo}
              customerName={customerName}
              BillAddress={BillAddress}
              ShipingAddress={ShipingAddress}
              IRNQR={IRNQR}
            />

            <PrintInvoiceTable
              head={head}
              body={body}
              pageRows={page.rows}
              alignments={alignments}
              itemsPerPage={
                isEmptyFooterPage
                  ? 9
                  : pageIndex === 0
                    ? computedBody.length <= 8
                      ? 8 // ✅ force 12 if total items <= 12
                      : 18 // ✅ otherwise allow 23 on first page
                    : isLastPage
                      ? 8
                      : 18
              }
              shouldShowTotal={shouldShowTotal}
              totalColumns={totalColumns}
              totals={isLastPage ? totals : page.subtotal}
              isLastPage={isLastPage}
              carriedForward={carriedForward}
            />

            {(isLastPage || isEmptyFooterPage) && (
              <PrintFooter
                bank={bank}
                totalAmount={totalAmount}
                cgst={cgst}
                sgst={sgst}
                totalGST={totalGST}
                roundedTotal={roundedTotal}
                grandTotalInWords={grandTotalInWords}
                client={client}
                invoiceInfo={invoiceInfo}
                isLastPage={isLastPage}
                BankQR={BankQR}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PrintFormat2;
