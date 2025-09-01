import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

interface ContactInfo {
  address?: string;
  phone?: string[];
  email?: string[];
}

interface PortfolioContactProps {
  contact: ContactInfo;
}

function ContactCard({ contact }: PortfolioContactProps) {
    const contactDetails = [
   { type: "address", value: contact.address, icon: <FaMapMarkerAlt size={28} /> },
    { type: "phone", value: contact.phone?.join(", "), phones: contact.phone, icon: <FaPhoneAlt size={28} /> },
    { type: "email", value: contact.email?.join(", "), emails: contact.email, icon: <FaEnvelope size={28} /> },
  ].filter((item) => item.value);
  return (
    <div>
        {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-20">
        {contactDetails.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-6 bg-white shadow-2xl rounded-lg border border-gray-200"
          >
            <div className="text-3xl bg-primary p-4 mb-5 text-white rounded-full">{item.icon}</div>

            {item.type === "phone" && item.phones ? (
              <div className="flex flex-col items-center space-y-1 mt-2">
                {item.phones.map((ph, i) => (
                  <a
                    key={i}
                    href={`tel:${ph}`}
                    className="text-gray-600 hover:text-primary cursor-pointer"
                  >
                    {ph}
                  </a>
                ))}
              </div>
            ) : item.type === "email" && item.emails ? (
              <div className="flex flex-col items-center space-y-1 mt-2">
                {item.emails.map((em, i) => (
                  <a
                    key={i}
                    href={`mailto:${em}`}
                    className="text-gray-600 hover:text-primary cursor-pointer"
                  >
                    {em}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center mt-2">{item.value}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContactCard