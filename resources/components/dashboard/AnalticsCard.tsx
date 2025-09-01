import { useState } from "react";
import { Card } from "../../../resources/components/chart/card";

function AnalticsCard() {
  const [data] = useState([
    {
      title: "purchase",
      amount: 1000,
      lastMonthAmt: 0,
      image: "/assets/logo.png",
      colors: "profit",
    },
    {
      title: "Sales",
      amount: 1000,
      lastMonthAmt: 0,
      image: "/assets/logo.png",
      colors: "sales",
    },
    {
      title: "Payables",
      amount: 1000,
      lastMonthAmt: 0,
      image: "/assets/logo.png",
      colors: "pay",
    },
    {
      title: "Receivables",
      amount: 1000,
      lastMonthAmt: 0,
      image: "/assets/logo.png",
      colors: "receive",
    },
  ]);
  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((data, idx) => (
        <Card
          key={idx}
          className={`p-5 flex flex-col gap-2 relative shadow-lg hover:-translate-1 hover:ring-2 hover:ring-ring`}
        >
          <img
            src={data.image}
            className="w-15 h-15 absolute top-0 right-0 m-5"
            alt=""
          />
          <h3 className={`font-bold text-lg text-${data.colors}`}>
            {data.title}
          </h3>
          <p className="text-xl font-bold">₹ {data.amount}</p>
          <div className="text-foreground/60">last month</div>
          <p>{data.lastMonthAmt}</p>
        </Card>
      ))}
    </div>
  );
}

export default AnalticsCard;
