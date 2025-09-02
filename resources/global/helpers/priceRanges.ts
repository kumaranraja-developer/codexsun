// utils/priceRanges.ts
export const categoryPriceRanges: Record<
  string,
  { id: number; label: string; min: number; max: number }[]
> = {
  "": [
    { id: 1, label: "Below ₹ 1,000", min: 0, max: 1000 },
    { id: 2, label: "₹ 1,000 – ₹ 5,000", min: 1000, max: 5000 },
    { id: 3, label: "₹ 5,000 – ₹ 10,000", min: 5000, max: 10000 },
    { id: 4, label: "₹ 10,000 – ₹ 30,000", min: 10000, max: 30000 },
    { id: 5, label: "₹ 30,000 – ₹ 60,000", min: 30000, max: 60000 },
    { id: 6, label: "₹ 60,000 – ₹ 1,00,000", min: 60000, max: 100000 },
    { id: 7, label: "Above ₹ 1,00,000", min: 100000, max: Infinity },
  ],
  Laptop: [
    { id: 1, label: "Below ₹ 40,000", min: 0, max: 40000 },
    { id: 2, label: "₹ 40,000 – ₹ 55,000", min: 40000, max: 55000 },
    { id: 3, label: "₹ 55,000 – ₹ 70,000", min: 55000, max: 70000 },
    { id: 4, label: "₹ 70,000 – ₹ 1,20,000", min: 70000, max: 120000 },
    { id: 5, label: "Above ₹ 1,20,000", min: 120000, max: Infinity },
  ],
  Desktop: [
    { id: 1, label: "Below ₹ 10,000", min: 0, max: 10000 },
    { id: 2, label: "₹ 10,000 – ₹ 20,000", min: 10000, max: 20000 },
    { id: 3, label: "Above ₹ 20,000", min: 20000, max: Infinity },
  ],
  PC: [
    { id: 1, label: "Below ₹ 10,000", min: 0, max: 10000 },
    { id: 2, label: "₹ 10,000 – ₹ 20,000", min: 10000, max: 20000 },
    { id: 3, label: "Above ₹ 20,000", min: 20000, max: Infinity },
  ],
  Printer: [
    { id: 1, label: "Below ₹ 10,000", min: 0, max: 10000 },
    { id: 2, label: "₹ 10,000 – ₹ 20,000", min: 10000, max: 20000 },
    { id: 3, label: "Above ₹ 20,000", min: 20000, max: Infinity },
  ],
  Camera: [
    { id: 1, label: "Below ₹ 10,000", min: 0, max: 10000 },
    { id: 2, label: "₹ 10,000 – ₹ 20,000", min: 10000, max: 20000 },
    { id: 3, label: "Above ₹ 20,000", min: 20000, max: Infinity },
  ],
  CPU: [
    { id: 1, label: "Below ₹ 10,000", min: 0, max: 10000 },
    { id: 2, label: "₹ 10,000 – ₹ 20,000", min: 10000, max: 20000 },
    { id: 3, label: "Above ₹ 20,000", min: 20000, max: Infinity },
  ],
  "Networking - Router": [
    { id: 1, label: "Below ₹ 10,000", min: 0, max: 10000 },
    { id: 2, label: "₹ 10,000 – ₹ 20,000", min: 10000, max: 20000 },
    { id: 3, label: "Above ₹ 20,000", min: 20000, max: Infinity },
  ],
  Server: [
    { id: 1, label: "Below ₹ 10,000", min: 0, max: 10000 },
    { id: 2, label: "₹ 10,000 – ₹ 20,000", min: 10000, max: 20000 },
    { id: 3, label: "Above ₹ 20,000", min: 20000, max: Infinity },
  ],
  Accessories: [
    { id: 1, label: "Below ₹ 10,000", min: 0, max: 10000 },
    { id: 2, label: "₹ 10,000 – ₹ 20,000", min: 10000, max: 20000 },
    { id: 3, label: "Above ₹ 20,000", min: 20000, max: Infinity },
  ],
  Mouse: [
    { id: 1, label: "Below ₹ 500", min: 0, max: 500 },
    { id: 2, label: "₹ 500 – ₹ 1,000", min: 500, max: 1000 },
    { id: 3, label: "Above ₹ 5,000", min: 5000, max: Infinity },
  ],
  "Gaming Keyboard": [
    { id: 1, label: "Below ₹ 500", min: 0, max: 500 },
    { id: 2, label: "₹ 500 – ₹ 1,000", min: 500, max: 1000 },
    { id: 3, label: "Above ₹ 5,000", min: 5000, max: Infinity },
  ],
};
