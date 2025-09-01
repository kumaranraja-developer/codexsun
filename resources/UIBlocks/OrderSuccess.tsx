import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import Button from "../../resources/components/button/Button"; // Ensure this is installed

interface OrderSuccessProps {
  orderId: string;
  paymentId: string;
  onContinue?: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({
  orderId,
  paymentId,
  onContinue,
}) => {
  useEffect(() => {
    confetti({
      particleCount: 450,
      spread: 70,
      origin: { y: 0.9 },
      zIndex: 999999,
    });
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center border border-ring/80 justify-center p-6 bg-background/70 shadow-md rounded-md text-center space-y-4 relative overflow-hidden">

      <CheckCircle className="text-green-500 w-16 h-16" />
      <h2 className="text-2xl font-bold text-green-700">Payment Successful!</h2>
      <p className="text-foreground/90">Your order has been placed successfully.</p>

      <div className="w-full max-w-sm space-y-2 text-left">
        <div className="flex justify-between border-b border-ring/30 pb-1">
          <span className="font-medium text-foreground/90">Order ID:</span>
          <span className="text-foreground/90">{orderId}</span>
        </div>
        <div className="flex justify-between border-b border-ring/30 pb-1">
          <span className="font-medium text-foreground/90">Payment ID:</span>
          <span className="text-foreground/90">{paymentId}</span>
        </div>
      </div>

      <Button
        onClick={onContinue}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        label={"Continue Shopping"}
      />
    </div>
  );
};

export default OrderSuccess;
