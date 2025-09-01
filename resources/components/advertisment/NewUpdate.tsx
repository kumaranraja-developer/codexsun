import { useEffect, useState } from "react";
import Button from "../../../resources/components/button/Button";

interface NewUpdateProps {
  id: string;
  title: string;
  description: string;
  api: string;
  onClose?: () => void;
  onStatus?: (message: string) => void;
}

function NewUpdate({
  id,
  title,
  description,
  api,
  onClose,
  onStatus,
}: NewUpdateProps) {
  const [visible, setVisible] = useState(false);
  const [doNotShow, setDoNotShow] = useState(false);

  useEffect(() => {
    const permanentlyDismissed = localStorage.getItem(
      `announcement_dismissed_${id}`
    );
    const temporarilyDismissed = sessionStorage.getItem(
      `announcement_temp_dismissed_${id}`
    );
    if (!permanentlyDismissed && !temporarilyDismissed) {
      setVisible(true);
    }
  }, [id]);

  const handleClose = async () => {
    try {
      const response = await fetch(api, { method: "GET" });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (onStatus) onStatus("✅ Latest update successfully.");
    } catch (err) {
      console.error("API update failed", err);
      if (onStatus) onStatus("❌ Update failed. Try again.");
    }

    setVisible(false);
    if (onClose) onClose();
  };

  const handleCancel = () => {
    // Only close the modal, no API call or storage update
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`
          w-[90vw] max-w-[450px] px-5 py-4 rounded-lg shadow-xl border
          ring-1 ring-blue-300 dark:ring-blue-800
          dark:bg-blue-950
          text-foreground bg-background
          animate-fade-in
        `}
      >
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-foreground/80 mb-4">{description}</p>

        <div className="flex items-center justify-between">
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={doNotShow}
              onChange={() => setDoNotShow((v) => !v)}
              className="accent-blue-600"
            />
            Don't show again
          </label>

          <div className="flex gap-2">
            <Button
              label="Cancel"
              onClick={handleCancel}
              className="text-sm bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
              children={undefined}
            />
            <Button
              label="OK"
              onClick={handleClose}
              className="text-sm bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              children={undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewUpdate;
