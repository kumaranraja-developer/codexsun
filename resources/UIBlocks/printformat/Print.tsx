import { useState } from 'react';
import SafeToWords from "../../global/helpers/NumberToWords";

interface PrintProps {
  head: string[];
  body: string[][];
  client: {
    name: string;
    address: Address;
  };
}
interface Address {
  address1: string;
  address2: string;
  address3: string;
  address4: string;
}

function Print({ head, body, client }: PrintProps) {
  const [company] = useState({
    name: "AARAN SOFTWARE PVT LTD",
    address: {
      address1: "7, Anjal Nagar 3rd street",
      address2: "Postal Colony, Chennai",
      address3: "9655227738",
      address4: "29AABCT1332L000",
    }
  });

  const [account] = useState({
    accountNo: "D123456789101112",
    IFSC: "DEMO1234",
    Bank: "Demo Bank",
    Branch: "DEMO BRANCH",
  });

  const quantityIndex = head.findIndex((h) => h.toLowerCase().includes("quantity"));
  const priceIndex = head.findIndex((h) => h.toLowerCase().includes("price"));
  const amountIndex = head.findIndex((h) => h.toLowerCase().includes("amount"));
  const totalIndex = head.findIndex((h) => h.toLowerCase() === "total");
  const hasTotalColumn = totalIndex !== -1;

  const day = new Date();
  const today = `${String(day.getDate()).padStart(2, '0')}-${String(day.getMonth() + 1).padStart(2, '0')}-${day.getFullYear()}`;
  const hasQuantity = quantityIndex !== -1;
const hasAmount = amountIndex !== -1;
const hasPrice = priceIndex !== -1;
const shouldShowTotal = hasQuantity && (hasAmount || hasPrice);

  const computedBody = body.map((row) => {
  let rowTotal = 0;
  if (shouldShowTotal) {
    if (hasAmount) {
      rowTotal = (parseFloat(row[quantityIndex]) || 0) * (parseFloat(row[amountIndex]) || 0);
    } else if (hasPrice) {
      rowTotal = (parseFloat(row[quantityIndex]) || 0) * (parseFloat(row[priceIndex]) || 0);
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
  const grandTotalInWords = SafeToWords(roundedTotal).replace(/\b\w/g, (l: string) => l.toUpperCase()) + ' Rupees Only';


  return (
    <div className="border border-ring w-full text-xs overflow-x-auto">
      {/* header */}
      <div className="grid grid-cols-[20%_80%] gap-5 p-5">
        <img className="w-full max-w-[120px] block m-auto" src={'/assets/svg/logo.svg'} alt="Logo" />
        <div className="flex flex-col items-center justify-center text-center gap-1">
          <h1 className="text-3xl font-bold">{company.name}</h1>
          {Object.values(company.address).map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      </div>

      {/* Invoice Title */}
      <h3 className="font-bold border-t border-ring text-lg text-center py-2">TAX INVOICE</h3>

      {/* Billing Info */}
      <div className="grid grid-cols-2 border-t border-b border-ring">
        <div className="border-r border-ring p-5 flex flex-col gap-1">
          <h1 className="text-sm font-bold">{client.name}</h1>
          {Object.values(client.address).map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
        <div className="p-5 flex flex-col gap-2">
          <div className="flex justify-between"><p className="font-semibold">Invoice No</p><p>1</p></div>
          <div className="flex justify-between"><p className="font-semibold">Date</p><p>{today}</p></div>
          <div className="flex justify-between"><p className="font-semibold">IRN</p><p></p></div>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full table-fixed border-b border-ring">
        <thead>
  <tr>
    {head.map((h, i) => (
      <th key={i} className="border border-ring px-3 py-2 text-center font-semibold">{h}</th>
    ))}
    {shouldShowTotal && (
      <th className="border border-ring px-3 py-2 text-center font-semibold">Total</th>
    )}
  </tr>
</thead>

        <tbody>
  {Array.from({ length: 12 }).map((_, rowIndex) => {
    const row = computedBody[rowIndex];
    return (
      <tr key={rowIndex} className="h-[22px]">
        {head.map((_, i) => (
          <td key={i} className="border-x border-ring px-3 text-center">{row?.[i] || ""}</td>
        ))}
        {shouldShowTotal && (
          <td className="border-x border-ring px-3 text-center">
            {row?.[row.length - 1] || ""}
          </td>
        )}
      </tr>
    );
  })}
</tbody>

        <tfoot className="border-t border-ring text-center">
  <tr>
    {head.map((_, i) => {
      if (i === 0) return <td className="p-2 border-ring" key={i}>Total</td>;
      if (i === quantityIndex) return <td className="p-2 border-ring" key={i}>{totalQuantity}</td>;
      return <td className="p-2 border-ring" key={i}></td>;
    })}
    {shouldShowTotal && (
      <td className="p-2 border-ring">{totalAmount.toFixed(2)}</td>
    )}
  </tr>
</tfoot>

      </table>

      {/* Tax Section */}
      <div className="w-full grid grid-cols-2">
        <div className="p-2 border-r border-ring flex flex-col gap-2">
          <p>
            We hereby certify that our registration under the GST Act 2017 is in force...
          </p>
          <ul>
            <li className="font-semibold">Goods once sold cannot be returned or exchanged</li>
            <li className="font-semibold">Seller is not responsible for any damage/mistakes</li>
          </ul>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between"><p className="font-semibold">ACCOUNT NO</p><p>{account.accountNo}</p></div>
            <div className="flex justify-between"><p className="font-semibold">IFSC CODE</p><p>{account.IFSC}</p></div>
            <div className="flex justify-between"><p className="font-semibold">BANK NAME</p><p>{account.Bank}</p></div>
            <div className="flex justify-between"><p className="font-semibold">BRANCH</p><p>{account.Branch}</p></div>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between border-b border-ring p-2"><p>Taxable Amount</p><p>{totalAmount.toFixed(2)}</p></div>
            <div className="flex justify-between border-b border-ring p-2"><p>CGST (9%)</p><p>{cgst.toFixed(2)}</p></div>
            <div className="flex justify-between border-b border-ring p-2"><p>SGST (9%)</p><p>{sgst.toFixed(2)}</p></div>
            <div className="flex justify-between border-b border-ring p-2"><p>Total GST</p><p>{totalGST.toFixed(2)}</p></div>
          </div>
          <div className="flex justify-between border-t border-ring p-2"><p>Round Off</p><p>{roundOff}</p></div>
        </div>
      </div>

      {/* Grand Total Section */}
      <div className="w-full grid grid-cols-2 border-t border-ring">
        <div className="border-r border-ring p-2">
          <p>Amount (in words)</p>
          <p className="font-bold">{grandTotalInWords}</p>
        </div>
        <div className="flex justify-between items-center p-2">
          <p className="text-lg font-bold">Grand Total</p>
          <p>{roundedTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full grid grid-cols-2 border-t border-ring">
        <div className="p-2">Receiver Sign</div>
        <div>
          <p className="text-center p-2">For {company.name}</p>
          <p className="mt-10 text-center p-2">Authorised Signatory</p>
        </div>
      </div>
    </div>
  );
}

export default Print;
