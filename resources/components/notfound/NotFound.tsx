import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Button from "../button/Button";

type NotFoundProps = {
  title?: string;
  description?: string;
  buttonLabel?: string;
  homePath?: string;
  highlightColor?: string; // Tailwind color like "text-primary" or "text-blue-600"
};

const NotFound: React.FC<NotFoundProps> = ({
  title = "404 - Page Not Found",
  description = "The page you are looking for doesn’t exist or has been moved.",
  buttonLabel = "Go Home",
  homePath = "/",
  highlightColor = "text-blue-600",
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`text-8xl font-extrabold ${highlightColor} drop-shadow-sm`}
        >
          404
        </motion.h1>

        <h2 className="mt-4 text-2xl font-semibold text-gray-800">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6"
        >
          <Button
            onClick={() => navigate(homePath)}
            className="px-6 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {buttonLabel}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
