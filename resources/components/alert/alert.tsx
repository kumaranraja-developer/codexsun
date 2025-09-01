import { useEffect, useState } from "react";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { MdErrorOutline, MdCancel, MdWarning } from "react-icons/md";

interface AlertProps {
  type: "success" | "update" | "delete" | "warning";
  message: string;
  show: boolean;
  onClose?: () => void;
}

function Alert({ type, message, show, onClose }: AlertProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  const config = {
    success: {
      className: "bg-create border-l-black text-white",
      icon: <IoCheckmarkDoneCircleSharp size={24} />,
    },
    update: {
      className: "bg-update border-l-black text-white",
      icon: <MdCancel size={24} />,
    },
    delete: {
      className: "bg-delete border-l-black text-white",
      icon: <MdErrorOutline size={24} />,
    },
    warning: {
      className: "bg-warning border-l-black text-white",
      icon: <MdWarning size={24} />,
    },
  };

  const { className, icon } = config[type];

  return (
     <div
      className={`w-[300px] md:w-96 flex items-center border-l-4 gap-4 p-4 px-3 md:px-6 border border-ring rounded-lg shadow-lg transition-all duration-700 ease-in-out animate-slide-in-right ${className}`}
    >
      {icon}
      <span className="text-base font-medium text-white">{message}</span>
    </div>
  );
}

export default Alert;
