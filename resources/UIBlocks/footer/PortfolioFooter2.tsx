import React from "react";

interface LinkItem {
  label: string;
  url: string;
}

interface SocialLink {
  icon: React.ReactNode;
  label: string;
  url: string;
}

interface PortfolioFooterProps {
  logo: string; // logo image
  newsletterTitle: string;
  newsletterPlaceholder: string;
  newsletterButton: string;
  companyLinks: LinkItem[];
  utilityLinks: LinkItem[];
  socialLinks: SocialLink[];
  copyright: string;
}

const PortfolioFooter: React.FC<PortfolioFooterProps> = ({
  logo,
  newsletterTitle,
  newsletterPlaceholder,
  newsletterButton,
  companyLinks,
  utilityLinks,
  socialLinks,
  copyright,
}) => {
  return (
    <footer className="bg-[#0d1b3d] text-white pb-5 pt-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Grid: Logo + Newsletter */}
        {/* Left Grid: Logo + Newsletter */}
        <div>
          <img src={logo} alt="Logo" className="h-12 mb-6" />
          <h3 className="text-2xl font-bold mb-6 leading-snug">
            {newsletterTitle}
          </h3>

          <form className="flex items-center bg-white rounded-full overflow-hidden w-full max-w-md">
            <input
              type="email"
              placeholder={newsletterPlaceholder}
              className="flex-1 px-4 py-3 text-gray-800 outline-none"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-primary to-primary/30 hover:to-primary px-6 py-3 m-1 cursor-pointer text-white font-medium rounded-r-full"
            >
              {newsletterButton}
            </button>
          </form>
        </div>

        {/* Right Grid: Company + Utility + Social */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.url} className="hover:text-primary">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Utility Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Utility Pages</h4>
            <ul className="space-y-2">
              {utilityLinks.map((link, i) => (
                <li key={i}>
                  <a href={link.url} className="hover:text-primary">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Social Media</h4>
            <ul className="space-y-3">
              {socialLinks.map((social, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-xl">{social.icon}</span>
                  <a href={social.url} className="hover:text-primary">
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/20 mt-12 pt-6 text-center text-sm text-gray-400">
        {copyright} Powered by <a href="https://my.codexsun.com/" target="_blank">Aaran</a>.
      </div>
    </footer>
  );
};

export default PortfolioFooter;
