import FloatContact from "../contact/FloatContact";
import { IconType } from "react-icons";
import Alert from "../../components/alert/alert";
import { useState } from "react";
type SocialLink = {
  id: string;
  href: string;
  img: string;
  alt: string;
};
type AddressItem = {
  title: string;
  details: string;
  email?: string;
  icon: IconType;
};
type ContactProps = {
  title?: string;
  image?: string;
  addresses: AddressItem[];
  socialLinks: SocialLink[];
  iconSize: string;
};
interface FormData {
  name: string;
  email: string;
  message: string;
}
export default function Contact1({
  title = "Contact Us",
  addresses,
  socialLinks,
  iconSize,
}: ContactProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });

  const [alertType, setAlertType] = useState<
    "success" | "update" | "delete" | "warning" | "failed"
  >("success");
  const [message, setMessage] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);

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
    <div className=" overflow-x-hidden">
      <h1 className="sr-only">{title}</h1>

      <div className="absolute top-3 right-0 z-100">
        <Alert
          type={alertType}
          message={message}
          show={showAlert}
          onClose={() => setShowAlert(false)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Image Section */}

        {/* Form Section */}
        <form
          className="flex flex-col space-y-4 md:px-[10%]"
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
          {/* {status && <p className="mt-3 text-sm">{status}</p>} */}
        </form>

        {/* Address & Social Section */}
        <div className="space-y-8 text-background">
          {/* Multiple addresses */}
          {addresses.map((addr, idx) => {
            const Icon = addr.icon;
            return (
              <div key={idx} className="flex items-start space-x-3 md:w-[80%]">
                <Icon className="text-2xl block my-auto text-foreground shrink-0" />{" "}
                {/* dynamic */}
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    {addr.title}
                  </h3>
                  <p className="text-foreground/70">{addr.details}</p>
                  {addr.email && (
                    <a
                      href={`mailto:${addr.email}`}
                      className="block text-primary mt-1"
                    >
                      {addr.email}
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          <FloatContact
            contacts={socialLinks.map((link) => {
              // Detect platform from URL
              let id: string = "link";
              if (link.id === "whatsapp") id = "whatsapp";
              else if (link.id === "instagram") id = "instagram";
              else if (link.id === "facebook") id = "facebook";
              else if (link.id === "linkedin") id = "linkedin";
              else if (link.id === "email") id = "email";
              else if (link.id === "phone") id = "phone";

              return {
                id,
                contact: link.href,
                imgPath: link.img,
                defaultMessage:
                  id === "whatsapp"
                    ? "Hello, I’m interested in this product. Could you please share more details?"
                    : undefined,
              };
            })}
            className=""
            horizontal={true}
            labelPosition="top"
            iconSize={iconSize}
          />
        </div>
      </div>
    </div>
  );
}
