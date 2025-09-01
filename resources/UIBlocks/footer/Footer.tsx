import { Link } from "react-router-dom";
import { CiFacebook } from "react-icons/ci";
import { FiTwitter } from "react-icons/fi";
import { FaInstagram, FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useState } from "react";
import NewUpdate from "../../components/advertisment/NewUpdate";

interface SocialLinks {
  whatsapp?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
}

interface FooterProps {
  aboutLinks: { label: string; path: string }[];
  servicesLinks: { label: string; path: string }[];
  policyLinks: { label: string; path: string }[];
  contact: { phone: string; email: string };
  address: { company: string; lines: string[]; website?: string; infoEmail?: string };
  social: SocialLinks;
  version: string;
  updateTitle?: string;
  updateDescription?: string;
  updateApi?: string;
}

const Footer: React.FC<FooterProps> = ({
  aboutLinks,
  servicesLinks,
  policyLinks,
  contact,
  address,
  social,
  version,
  updateTitle = "🚀 New Update Available!",
  updateDescription = "We’ve introduced major improvements and features. Check it out now!",
  updateApi = "http://tmnext.in:5001//api/update",
}) => {
  const [successMessage, setSuccessMessage] = useState("");
  const [showUpdate, setShowUpdate] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleVisible = () => {
    setResetKey((prev) => prev + 1);
    setShowUpdate(true);
  };

  const handleCloseUpdate = () => {
    setShowUpdate(false);
  };

  const handleUpdateStatus = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <footer className="text-sm mt-5 cursor-default">
      <div className="grid grid-cols-1 px-[5%] sm:grid-cols-2 lg:grid-cols-4 gap-6 py-10">
        {/* About */}
        <div>
          <h5 className="font-bold mb-2">About Us</h5>
          <ul className="space-y-1">
            {aboutLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.path} className="hover:underline text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h5 className="font-bold mb-2">Services</h5>
          <ul className="space-y-1">
            {servicesLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.path} className="hover:underline text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Consumer Policy */}
        <div>
          <h5 className="font-bold mb-2">Consumer Policy</h5>
          <ul className="space-y-1">
            {policyLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.path} className="hover:underline text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <FaPhoneAlt className="w-7 h-7 p-1 cursor-pointer" />
              <a href={`tel:${contact.phone}`} className="text-lg">
                {contact.phone}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MdEmail className="w-7 h-7 p-1 cursor-pointer" />
              <a href={`mailto:${contact.email}`} className="text-lg">
                {contact.email}
              </a>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <p className="text-white leading-6">
            <span className="font-bold text-2xl">{address.company}</span>,
            <br />
            {address.lines.map((line, idx) => (
              <span key={idx}>
                {line}
                <br />
              </span>
            ))}
          </p>
          {address.website && (
            <h6 className="mt-3 font-semibold cursor-pointer">{address.website}</h6>
          )}
          {address.infoEmail && (
            <a
              className="mt-3 font-semibold cursor-pointer block"
              href={`mailto:${address.infoEmail}`}
            >
              {address.infoEmail}
            </a>
          )}

          <h6 className="mt-3 font-semibold">Social:</h6>
          <div className="flex gap-3 mt-1">
            {social.whatsapp && (
              <a href={social.whatsapp} target="_blank" rel="noreferrer">
                <FaWhatsapp className="w-8 h-8 p-1 hover:-translate-y-1 transition-transform cursor-pointer" />
              </a>
            )}
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noreferrer">
                <CiFacebook className="w-8 h-8 p-1 hover:-translate-y-1 transition-transform cursor-pointer" />
              </a>
            )}
            {social.twitter && (
              <a href={social.twitter} target="_blank" rel="noreferrer">
                <FiTwitter className="w-8 h-8 p-1 hover:-translate-y-1 transition-transform cursor-pointer" />
              </a>
            )}
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noreferrer">
                <FaInstagram className="w-8 h-8 p-1 hover:-translate-y-1 transition-transform cursor-pointer" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* New Update */}
      {showUpdate && (
        <NewUpdate
          key={resetKey}
          id="new update"
          title={updateTitle}
          description={updateDescription}
          api={updateApi}
          onClose={handleCloseUpdate}
          onStatus={handleUpdateStatus}
        />
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded shadow-md z-50">
          {successMessage}
        </div>
      )}

      {/* Footer Bottom */}
      <div className="flex flex-row justify-between border-t border-white/10">
        <div></div>
        <div className="text-center py-3 ">
          &copy; {new Date().getFullYear()} {address.company}. All Rights Reserved.
        </div>
        <div
          className="block my-auto text-background/50 pr-5 cursor-pointer"
          onClick={handleVisible}
        >
          {version}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
