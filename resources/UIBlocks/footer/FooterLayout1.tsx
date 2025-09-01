import { Link } from "react-router-dom";
import NewUpdate from "../../../resources/components/advertisment/NewUpdate";
import { useState } from "react";

interface FooterColumn {
  title: string;
  items: { label: string; href: string }[];
}

interface FooterLayoutProps {
  about: FooterColumn;
  help: FooterColumn;
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
  version: string;
  copyrights: string;
}

const FooterLayout1: React.FC<FooterLayoutProps> = ({
  about,
  help,
  consumerPolicy,
  address,
  updateConfig,
  version,
  copyrights,
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
      <h5 className="font-bold mb-2">{column.title}</h5>
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
      <div className="grid grid-cols-1 px-[5%] sm:grid-cols-2 md:grid-cols-4 gap-6 py-10">
        {renderColumn(about)}
        {renderColumn(help)}

        {/* Address */}
        <div>
          <h5 className="font-bold mb-2">Address</h5>
          <p className="text-white leading-6">
            {address.lines.map((line, idx) => (
              <span key={idx}>
                {line}
                <br />
              </span>
            ))}
          </p>
          <h6 className="mt-3 font-semibold">Social:</h6>
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

        {/* Consumer Policy */}
        <div>
          {renderColumn(consumerPolicy)}
          <p className="mt-3">
            Phone:{" "}
            <a href={`tel:${consumerPolicy.phone}`} className="underline">
              {consumerPolicy.phone}
            </a>
            <br />
            Email:{" "}
            <a href={`mailto:${consumerPolicy.email}`} className="underline">
              {consumerPolicy.email}
            </a>
          </p>
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

      <div className="flex flex-row justify-between border-t border-white/10">
        <div></div>
        <div className="text-center py-3 bg-neutral-900">
          &copy; {copyrights}
        </div>
        <div
          className="block my-auto text-background/50 pr-5 cursor-pointer"
          onClick={handleVisible}
        >
          V {version}
        </div>
      </div>
    </footer>
  );
};

export default FooterLayout1;


// usage
{/* <FooterLayout1
          about={{
            title: "Quick links",
            items: [
              { label: "Home", href: "/" },
              { label: "About Us", href: "/about" },
              { label: "Product", href: "/product" },
              { label: "Blogs", href: "/blog" },
              { label: "Manufacture", href: "/manufacture" },
            ],
          }}
          help={{
            title: "Help",
            items: [
              { label: "FAQs", href: "/faq" },
              { label: "Contact", href: "/contact" },
            ],
          }}
          consumerPolicy={{
            title: "Consumer Policy",
            phone: "+91 98765 43210",
            email: "info@linkagro.com",
            items: [
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
            ],
          }}
          address={{
            lines: ["123 Agro Street", "Tamil Nadu, India", "PIN - 600001"],
            socialLinks: [
              { href: "https://instagram.com/linkagro", icon: <FaInstagram /> },
              { href: "https://facebook.com/linkagro", icon: <CiFacebook /> },
              { href: "https://twitter.com/linkagro", icon: <FiTwitter /> },
            ],
          }}
          updateConfig={{
            id: "version-check",
            title: "Version Update",
            description: "Click to check if you're on the latest version.",
            api: "/api/check-version", // Replace with your actual endpoint or mock
          }}
          version="1.0.0"
          copyrights="2025 Link Agro Exports. All Rights Reserved. Powered by Aaran Software"
        /> */}