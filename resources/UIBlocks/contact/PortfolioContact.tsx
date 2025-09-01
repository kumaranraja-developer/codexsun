import { useState } from "react";
import Alert from "../../../resources/components/alert/alert";

interface PortfolioContactProps {
  mapSrc: string;
}
interface FormData {
  name: string;
  email: string;
  message: string;
}
function PortfolioContact({ mapSrc }: PortfolioContactProps) {
  const [alertType, setAlertType] = useState<
    "success" | "update" | "delete" | "warning" | "failed"
  >("success");
  const [message, setMessage] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  // ✅ Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setAlertType("success");
        setMessage("Message Sent Successfully!");
        setFormData({ name: "", email: "", message: "" }); // reset form
      } else {
        setAlertType("failed");
        setMessage("⚠️ Error sending message.");
      }
    } catch (err) {
      console.error(err);
      setAlertType("failed");
      setMessage("⚠️ Error sending message.");
    }
    setShowAlert(true);
  };

  return (
    <div className="">
      <h1 className="text-5xl font-bold py-10 text-center text-foreground">
        Have Any Questions?
      </h1>
      <div className="fixed top-3 right-0 z-100">
        <Alert
          type={alertType}
          message={message}
          show={showAlert}
          onClose={() => setShowAlert(false)}
        />
      </div>
      {/* Map + Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-12">
        <div className="flex items-center">
          <iframe
            src={mapSrc}
            width="600"
            height="450"
            aria-label="location"
            loading="lazy"
            className="w-full rounded-lg shadow-lg"
          >
            {" "}
            <span className="sr-only">location</span>
          </iframe>
        </div>

        <div className="border border-ring/30 bg-background rounded-lg p-5 shadow-2xl">
          <form
            className="flex flex-col space-y-4 rounded-lg"
            onSubmit={handleSubmit}
          >
            <div>
              <label htmlFor="name" className="text-foreground text-lg">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-black"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-foreground text-lg">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-black"
              />
            </div>

            <div>
              <label htmlFor="message" className="text-foreground text-lg">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-black"
                rows={5}
              />
            </div>

            <button
              type="submit"
              aria-label="submit"
              className="bg-primary hover:bg-hover text-create-foreground py-2 px-6 rounded-md font-semibold cursor-pointer"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PortfolioContact;
