import { useRef, useEffect, useState } from "react";
import Radio_group from "../../resources/components/radioGroup/radio_group";
import DropdownRead from "../components/input/dropdown-read";
import FloatingInput from "../components/input/floating-input";
import Button from "../../resources/components/button/Button";

function OrderPayment() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>("UPI");
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });

  const cardRef = useRef<HTMLDivElement | null>(null);
  const upiRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedMethod === "cards" && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (selectedMethod === "UPI" && upiRef.current) {
      upiRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedMethod]);

  const paymentOptions = [
    { value: "UPI", label: "UPI", description: "Pay by a UPI Docs" },
    {
      value: "cards",
      label: "Credit / Debit / ATM Card",
      description: "Add Card",
    },
    {
      value: "netbanking",
      label: "NetBanking",
      description: "This instrument has low success",
    },
    { value: "emi", label: "EMI (Easy Installments)", description: "" },
    { value: "cod", label: "Cash on Delivery", description: "" },
  ];

  const [selectedNetBank, setSelectedNetBank] = useState<string | null>(null);
  const [selectedEmiBank, setSelectedEmiBank] = useState("hdfc");
  const [selectedEmiPlan, setSelectedEmiPlan] = useState<string | null>("6m");

  const popularBanks = [
    { value: "sbi", label: "State Bank of India" },
    { value: "hdfc", label: "HDFC Bank" },
    { value: "icici", label: "ICICI Bank" },
    { value: "other", label: "Other Bank" },
  ];

  const allBanks = [
    "Axis Bank",
    "Punjab National Bank",
    "Bank of Baroda",
    "Canara Bank",
    "Kotak Mahindra Bank",
    "Union Bank of India",
  ];

  const popularEmiProviders = [
    { value: "hdfc", label: "HDFC Bank Credit Card" },
    { value: "kotak", label: "KOTAK Bank Credit Card" },
  ];

  const emiPlansByBank: Record<string, any[]> = {
    hdfc: [
      { id: "6m", duration: "6 months", emi: 256, rate: "16% p.a.", value: 1465, interest: 70 },
      { id: "9m", duration: "9 months", emi: 174, rate: "16% p.a." , value: 1465, interest: 70},
      { id: "12m", duration: "12 months", emi: 133, rate: "16% p.a.", value: 1465, interest: 70 },
    ],
    kotak: [
      { id: "6m", duration: "6 months", emi: 260, rate: "16% p.a.", value: 1480, interest: 75 },
      { id: "9m", duration: "9 months", emi: 180, rate: "16% p.a.", value: 1465, interest: 70 },
    ],
  };

  return (
    <div className="block space-y-4 w-full bg-background">

      <div className="flex flex-col gap-3">
        {paymentOptions.map((option) => {
          const isSelected = selectedMethod === option.value;

          return (
            <div
              key={option.value}
              className={`border border-ring/30 rounded-md p-3 transition-all ${
                isSelected ? "border border-ring/30-blue-500" : ""
              }`}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => setSelectedMethod(option.value)}
                  className="accent-blue-600 w-4 h-4"
                />
                <div>
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-gray-500 ">{option.description}</div>
                  )}
                </div>
              </label>

              {/* UPI */}
              {isSelected && option.value === "UPI" && (
              <div>
                  <FloatingInput
                  ref={upiRef}
                  type="text"
                  placeholder="Enter UPI ID"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="mt-3 p-2 border border-ring/30 rounded w-full"
                  id="upiid"
                  label="UPI ID"
                  err=""
                />
                <Button className="bg-update text-update-foreground px-5 mt-2 block ml-auto" label={"Pay"} />
              </div>
              )}

              {/* Cards */}
              {isSelected && option.value === "cards" && (
                <div ref={cardRef} className="mt-3 flex flex-col gap-2">
                  <FloatingInput
                    type="text"
                    placeholder="Card Number"
                    value={cardDetails.number}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, number: e.target.value })
                    }
                    id="cardnumber"
                    label="Card Number"
                    err=""
                  />
                  <FloatingInput
                    type="text"
                    placeholder="Expiry (MM/YY)"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, expiry: e.target.value })
                    }
                    id="expiry"
                    label="Expiry (MM/YY)"
                    err=""
                  />
                  <FloatingInput
                    type="password"
                    placeholder="CVV"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                    id="cvv"
                    label="CVV"
                    err=""
                  />
                <Button className="bg-update text-update-foreground px-5 mt-2 block ml-auto" label={"Pay"} />

                </div>
              )}

              {/* NetBanking */}
              {isSelected && option.value === "netbanking" && (
                <div className="mt-3 space-y-3">
                  <Radio_group
                    name="netbanking"
                    options={popularBanks}
                    defaultValue={selectedNetBank ?? undefined}
                    onChange={(val) => setSelectedNetBank(val)}
                  />

                  {selectedNetBank === "other" && (
                    <DropdownRead
                      id="otherBank"
                      items={allBanks}
                      label="Select your bank"
                      err=""
                      value=""
                      onChange={(val) => {
                        console.log("Selected other bank:", val);
                      }}
                      placeholder="Other Bank"
                    />
                  )}
                <Button className="bg-update text-update-foreground px-5 mt-2 block ml-auto" label={"Pay"} />

                </div>
              )}

              {/* EMI */}
              {isSelected && option.value === "emi" && (
                <div className="mt-3 flex border border-ring/30 rounded overflow-hidden">
                  {/* Bank Tabs */}
                  <div className="w-64 border-r border-ring/30 ">
                    {popularEmiProviders.map((bank) => (
                      <div
                        key={bank.value}
                        onClick={() => {
                          setSelectedEmiBank(bank.value);
                          setSelectedEmiPlan("6m");
                        }}
                        className={`p-4 cursor-pointer text-sm font-medium border-b border-ring/30 ${
                          selectedEmiBank === bank.value ? "bg-background/50 text-blue-600" : ""
                        }`}
                      >
                        {bank.label}
                      </div>
                    ))}
                  </div>

                  {/* EMI Plans */}
                  <div className="flex-1 p-4">
                    <div className="text-sm text-gray-600 bg-yellow-50 p-3 border border-ring/30 rounded mb-4">
                      MAZSONE does not levy any charges for availing EMI. Charges, if any, are levied
                      by the bank. A processing fee of ₹ 299 will be charged by the bank/lender.
                    </div>

                    {(emiPlansByBank[selectedEmiBank] || []).map((plan) => {
                      const isActive = selectedEmiPlan === plan.id;
                      return (
                        <div
                          key={plan.id}
                          className={`border border-ring/30 rounded p-3 mb-3 ${
                            isActive ? "border border-ring/30-blue-600 bg-background" : "border border-ring/30-gray-300"
                          }`}
                        >
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="emi-plan"
                              checked={isActive}
                              onChange={() => setSelectedEmiPlan(plan.id)}
                              className="accent-blue-600 mt-1"
                            />
                            <div>
                              <div className="font-medium text-sm">
                                ₹ {plan.emi} for {plan.duration}
                                <span className="text-gray-500 text-xs"> @ {plan.rate}</span>
                              </div>

                              {isActive && (
                                <div className="mt-2 text-sm bg-background/70 border border-ring/30 rounded p-3">
                                  {plan.value && plan.interest && (
                                    <>
                                      <div className="flex justify-between mb-1">
                                        <span>EMI Value</span>
                                        <span>₹ {plan.value}</span>
                                      </div>
                                      <div className="flex justify-between mb-1">
                                        <span>Interest (charged by Bank)</span>
                                        <span>₹ {plan.interest}</span>
                                      </div>
                                      <div className="flex justify-between font-semibold mt-2 border-t border-ring/30 pt-2">
                                        <span>Total EMI for {plan.duration}</span>
                                        <span>₹ {plan.value + plan.interest}</span>
                                      </div>
                                    </>
                                  )}
                                  <Button className="mt-3 w-full bg-update text-white py-2 rounded text-sm font-medium" label={"CHOOSE THIS PLAN"}/>

                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderPayment;
