import React from "react";
import {
  PrintAddress,
  PrintBank,
  PrintInvoiceInfo,
} from "../../../resources/UIBlocks/printformat/PrintFormat2";
import { formatAmount } from "./PrintInvoiceTable";

interface PrintFooterProps {
  bank: PrintBank;
  invoiceInfo: PrintInvoiceInfo;
  totalAmount: number;
  cgst: number;
  sgst: number;
  totalGST: number;
  roundedTotal: number;
  grandTotalInWords: string;
  client: {
    name: string;
    address: PrintAddress;
    phone: number;
    email: string;
    gstinNo: string;
  };
  isLastPage: boolean;
  BankQR: string;
}

function PrintFooter({
  bank,
  totalAmount,
  cgst,
  sgst,
  totalGST,
  roundedTotal,
  grandTotalInWords,
  client,
  invoiceInfo,
  BankQR,
}: PrintFooterProps) {
  return (
    <div>
      <div className="w-full grid grid-cols-3">
        <div className="p-2 border-r border-ring flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <p className="font-bold">BANK NAME</p>
              <p className="text-sm">{bank.Bank}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-bold">ACCOUNT NO</p>
              <p className="text-sm">{bank.accountNo}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-bold">IFSC CODE</p>
              <p className="text-sm">{bank.IFSC}</p>
            </div>

            <div className="flex justify-between">
              <p className="font-bold">BRANCH</p>
              <p className="text-sm">{bank.Branch}</p>
            </div>
            <img
              className="w-[40%] onject-contain"
              src={BankQR}
              alt="Logo"
            />
          </div>
        </div>
        <div className="flex flex-col border-r border-ring p-2 justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <p className="font-bold">Freight Charges</p>
              <p>{totalAmount.toFixed(2)}</p>
            </div>
            <div className="flex gap-2 justify-between">
              <p className="font-bold">Transport Mode</p>
              <p className="text-left">{invoiceInfo.transportMode}</p>
            </div>

            <div className="flex gap-2 justify-between">
              <p className="font-bold">Vehicle No</p>
              <p className="text-left">{invoiceInfo.vehicleNo}</p>
            </div>

            <div className="flex gap-2 justify-between">
              <p className="font-bold">Date & Time Supply</p>
              <p className="text-left">{invoiceInfo.supplyDateTime}</p>
            </div>

            <div className="flex gap-2 justify-between">
              <p className="font-bold">Place of Supply</p>
              <p className="text-left">{invoiceInfo.placeOfSupply}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col p-2 border-ring justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <p className="font-bold">Taxable Amount</p>
              <p>{formatAmount(totalGST.toFixed(2))}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-bold">Total CGST (2.5%)</p>
              <p>{formatAmount(cgst.toFixed(2))}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-bold">Total SGST (2.5%)</p>
              <p>{formatAmount(sgst.toFixed(2))}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-bold">Total IGST (2.5%)</p>
              <p>{formatAmount(totalGST.toFixed(2))}</p>
            </div>
            <hr className="text-ring" />
            <div className="flex justify-between">
              <p className="font-bold">Total GST Amount</p>
              <p>{formatAmount(totalGST.toFixed(2))}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-bold">Other Charges</p>
              <p>{formatAmount(totalGST.toFixed(2))}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-bold">Round Off</p>
              <p>{formatAmount(roundedTotal.toFixed(2))}</p>
            </div>
            <hr className="text-ring" />
            <div className="flex justify-between">
              <p className="font-bold text-lg">Grand Total</p>
              <p className="text-lg">{formatAmount(roundedTotal.toFixed(2))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grand Total Section */}
      <div className="w-full border-t border-ring">
        <div className=" flex gap-2 border-ring p-2">
          <p className="font-bold">Amount in words :</p>
          <p className="">{grandTotalInWords}</p>
        </div>
      </div>
      <div className="w-full border-t border-ring">
        <div className="grid gap-2 border-ring p-2">
          <div>
            <p className="font-bold">Declaration</p>
            <p className="">
              We declare that this invoice shows the actual price of the goods
              described and that all particulars are true and correct.
            </p>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="w-full grid grid-cols-3 border-y border-ring">
        {/* First column - align left */}
        <div className="flex flex-col items-start justify-end">
          <p className="mt-6 text-left p-2">Customer Signature</p>
        </div>

        {/* Second column - align center */}
        <div className="flex flex-col items-center justify-end">
          <p className="mt-6 text-center p-2">Checked By</p>
        </div>

        {/* Third column - align right */}
        <div className="flex flex-col items-end justify-between">
          <p className="text-right p-2 text-lg tracking-widest">
            For <span className="font-bold">{client.name}</span>
          </p>
          <p className="mt-6 text-right p-2">Authorised Signatory</p>
        </div>
      </div>
    </div>
  );
}

export default PrintFooter;
