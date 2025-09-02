import React from "react";
import {
  PrintAddress,
  PrintBank,
  PrintCustomerAddress,
  PrintInvoiceInfo,
} from "../../../resources/UIBlocks/printformat/PrintFormat2";

interface PrintHeaderProps {
  client: {
    name: string;
    address: PrintAddress;
    phone: number;
    email: string;
    gstinNo: string;
  };
  logo: string;
  customerName: string;
  BillAddress: PrintCustomerAddress;
  ShipingAddress: PrintCustomerAddress;
  invoiceInfo: PrintInvoiceInfo;
  IRNQR:string
}

function PrintHeader({
  client,
  logo,
  invoiceInfo,
  customerName,
  BillAddress,
  ShipingAddress,
  IRNQR
}: PrintHeaderProps) {
  return (
    <div>
      <div className="grid grid-cols-[15%_65%_20%] gap-5 px-5">
        <img
          className="w-full block m-auto onject-contain  py-1"
          src={logo}
          alt="Logo"
        />
        <div className="flex flex-col items-center justify-center text-center text-xs  py-1">
          <h1 className="text-3xl font-bold tracking-widest">{client.name}</h1>
          {Object.values(client.address).map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
          <p>
            <span className="font-bold">Phone : </span>
            {client.phone} <span className="font-bold">Email : </span>
            {client.email}
          </p>
          <p className="font-bold text-lg">GSTIN : {client.gstinNo}</p>
        </div>
         <img
          className="w-[80%] h-[100%] block m-auto p-1 pr-3 my-auto onject-cover"
          src={IRNQR}
          alt="QR"
        />
      </div>

      {/* Invoice Title */}
      <h3 className="font-bold border-t border-ring text-md text-center py-1">
        TAX INVOICE
      </h3>

      {/* Tax Invoice Left side */}
      <div className="grid grid-cols-[70%_30%] border-t border-b border-ring">
        {/* Left side */}
        <div className="px-5 py-1 flex flex-col gap-2 border-ring">
          {/* Row: Invoice No */}
          <div className="flex  gap-1">
            <div className="w-[15%] flex justify-between">
              <p className="font-bold">Invoice No</p>
              <p>:</p>
            </div>
            <p className="font-bold w-[35%]">{invoiceInfo.invoiceNo}</p>
          </div>

          {/* Row: Invoice Date */}
          <div className="flex  gap-1">
            <div className="w-[15%] flex justify-between">
              <p className="font-bold">Invoice Date</p>
              <p>:</p>
            </div>

            <p className="font-bold w-[35%]">{invoiceInfo.invoiceDate}</p>
          </div>

          {/* Row: IRN */}
          <div className="flex  gap-1">
            <div className="w-[15%] flex justify-between">
              <p className="font-bold">IRN</p>
              <p>:</p>
            </div>
            <p className="break-all font-bold">{invoiceInfo.IRN}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="text-center py-1 font-bold border-r border-ring">
          Customer Name & billing Address
        </div>
        <div className="text-center py-1 font-bold">
          Customer Name & Shipping Address
        </div>

        <div className="text-center py-1 px-5 border-t border-r border-ring">
          {/* Name Row */}
          <div className="flex gap-2 items-start">
            <div className="w-[20%] flex justify-between">
              <p className="font-bold">Name</p>
              <p>:</p>
            </div>
            <p className="text-left w-[80%] font-bold">{customerName}</p>
          </div>

          {/* Address Row */}
          <div className="flex gap-2 pt-1 items-start">
            <div className="w-[20%] flex justify-between">
              <p className="font-bold">Address</p>
              <p>:</p>
            </div>
            <div className="flex flex-col w-[80%]">
              <p className="text-left">{BillAddress.address1}</p>
              <p className="text-left">{BillAddress.address2}</p>
              <p className="text-left">{BillAddress.address3}</p>
              <p className="text-left">{BillAddress.GSTIN}</p>
            </div>
          </div>
        </div>

        <div className="text-center py-1 px-5 border-t border-ring">
          {/* Name Row */}
          <div className="flex gap-2 items-start">
            <div className="w-[20%] flex justify-between">
              <p className="font-bold">Name</p>
              <p>:</p>
            </div>
            <p className="text-left w-[80%] font-bold">{customerName}</p>
          </div>

          {/* Address Row */}
          <div className="flex gap-2 pt-1 items-start">
            <div className="w-[20%] flex justify-between">
              <p className="font-bold">Address</p>
              <p>:</p>
            </div>
            <div className="flex flex-col w-[80%]">
              <p className="text-left break-words">{ShipingAddress.address1}</p>
              <p className="text-left break-words">{ShipingAddress.address2}</p>
              <p className="text-left break-words">{ShipingAddress.address3}</p>
              <p className="text-left break-words">{ShipingAddress.GSTIN}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrintHeader;
