import Barcode from "react-barcode";

interface BarCodeItem {
  title: string;
  value: string;
}

interface BarCodeProps {
  values?: BarCodeItem[];
}

function BarCode({ values = [] }: BarCodeProps) {
  return (
    <div className="flex flex-col gap-6 p-4">
      {values.map((item, index) => (
        <div
          key={index}
          className="w-max flex flex-col items-center justify-center border p-1 bg-white"
        >
          <p className="text-sm mt-1 text-center text-black">{item.title}</p>
          <div className="w-full h-[80px] flex items-center justify-center">
            <Barcode
              value={item.value}
              width={2}
              height={60}
              displayValue={false}
              background="#ffffff"
              lineColor="#000000"
            />
          </div>
          <p className="text-sm mt-1 text-center text-black">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export default BarCode;
