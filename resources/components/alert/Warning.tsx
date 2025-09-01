import { useEffect, useState } from "react";
import { Card, CardAction, CardContent, CardHeader } from "../../../resources/components/chart/card";
import AnimateButton from "../button/animatebutton";
import LoadingSpinner from "../loading/LoadingSpinner";

interface WarningProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

function Warning({ title, message, onConfirm, onClose }: WarningProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  const handleClose = async () => {
    setLoading(true);
    await onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="animate-scaleIn relative">
        <Card className="bg-background p-5 shadow-xl rounded-xl max-w-md w-full">
          <CardHeader className="text-lg font-semibold">{title}</CardHeader>
          <CardContent className="py-3 text-muted-foreground">{message}</CardContent>
          <CardAction className="flex justify-end gap-3 px-4 pb-2">
            <AnimateButton
              mode="close"
              label="Close"
              className="bg-delete"
              onClick={handleClose}
              disabled={loading}
            />
            <AnimateButton
              mode="confirm"
              label="Confirm"
              className="bg-create"
              onClick={handleConfirm}
              disabled={loading}
            />
          </CardAction>
        </Card>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
}

export default Warning;
