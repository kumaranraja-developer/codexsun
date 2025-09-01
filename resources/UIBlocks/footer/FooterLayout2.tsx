import { Link } from "react-router-dom";
import NewUpdate from "../../../resources/components/advertisment/NewUpdate";
import { useState } from "react";
import { FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import React from "react";

interface FooterColumn {
  title: string;
  items: { label: string; href: string }[];
}

interface FooterLayoutProps {
  about: FooterColumn;
  companyName: string;
  consumerPolicy: FooterColumn & { phone: string; email: string };
  address: {
    lines: string[];
    socialLinks: { icon: React.ReactNode; href: string }[];
  };
  updateConfig: {
    id: string;
    title: string;
    description: string;
    api: string;
  };
  mapLink: string;
  version: string;
  copyrights: string;
  copyrights_company: string;
}

const FooterLayout2: React.FC<FooterLayoutProps> = ({
  about,
  companyName,
  consumerPolicy,
  address,
  updateConfig,
  version,
  copyrights,
  copyrights_company,
  mapLink,
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

  const renderColumn = (column: FooterColumn) => (
    <div>
      <h5 className="font-bold mb-2 text-xl">{column.title}</h5>
      <ul className="space-y-1">
        {column.items.map((item, idx) => (
          <li key={idx}>
            <Link to={item.href} className="hover:underline text-white">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-neutral-900 text-white text-sm mt-5">
      <div className="grid grid-cols-1 px-[5%] sm:grid-cols-2 md:grid-cols-3 gap-6 py-10">
        {/* Address */}

        <div>
          <h5 className="font-bold mb-2 text-2xl">{companyName}</h5>
          <p className="text-white leading-6">
            {address.lines.map((line, idx) => (
              <span key={idx}>
                {line.split(",").map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part.trim()}
                    {i < arr.length - 1 && ","} {/* keep comma */}
                    {i < arr.length - 1 && <br />}{" "}
                    {/* break line after comma */}
                  </React.Fragment>
                ))}
                {idx < address.lines.length - 1 && <br />}{" "}
                {/* break between lines */}
              </span>
            ))}
          </p>
          <p className="my-3">
            <a
              href={`tel:${consumerPolicy.phone}`}
              className="flex items-center gap-1"
            >
              <FaPhone className="rotate-90 shrink-0 w-5 h-5" /> {consumerPolicy.phone}
            </a>
            <br />
            <a
              href={`mailto:${consumerPolicy.email}`}
              className="flex items-center gap-1"
            >
              <MdEmail className="shrink-0 w-5 h-5" /> {consumerPolicy.email}
            </a>
          </p>
          <div className="flex gap-3 mt-1">
            {address.socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-10 h-10 p-2 hover:-translate-y-1 transition-transform cursor-pointer text-white text-2xl">
                  {link.icon}
                </div>
              </a>
            ))}
          </div>
        </div>

        {renderColumn(about)}

        {/* Consumer Policy */}
        <div>
          <h1 className="font-bold mb-2 text-xl">Visit Us</h1>
          <iframe
            src={mapLink}
            className="w-[100%] md:w-[80%]"
            height="max"
            loading="lazy"
          ></iframe>
        </div>
      </div>

      {showUpdate && (
        <NewUpdate
          key={resetKey}
          id={updateConfig.id}
          title={updateConfig.title}
          description={updateConfig.description}
          api={updateConfig.api}
          onClose={handleCloseUpdate}
          onStatus={handleUpdateStatus}
        />
      )}

      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded shadow-md z-50">
          {successMessage}
        </div>
      )}

      <div className="flex flex-row gap-3 justify-between border-t border-white/10">
        <div></div>
        <div className="text-center py-3 bg-neutral-900">
          &copy; {copyrights}{" "}
          <a href="https://my.codexsun.com/" target="_blank">
            {copyrights_company}
          </a>
        </div>
        <div
          className="block my-auto text-background/50 pr-5 cursor-pointer whitespace-nowrap"
          onClick={handleVisible}
        >
          V {version}
        </div>
      </div>
    </footer>
  );
};

export default FooterLayout2;
