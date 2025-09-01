import React, { JSX } from "react";
import { IconType } from "react-icons";
import { useAppSettings } from "../../../apps/global/useSettings";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button/Button";

type ContactInfo = {
  icon: IconType;
  value: string;
  href?: string;
};

type SocialLink = {
  href: string;
  icon: JSX.Element;
};

type PageLink = {
  label: string;
  href: string;
};

type FooterProps = {
  address: string;
  contacts: ContactInfo[];
  socialLinks?: SocialLink[];
  pages?: PageLink[];
  newsletterText?: string;
  newsletterPlaceholder?: string;
  newsletterButtonText?: string;
  companyName: string;
  textColor?: string;
  version?: string;
  poweredCompany?: string;
  poweredUrl?: string;
};

const PortfolioFooter3: React.FC<FooterProps> = ({
  address,
  contacts,
  socialLinks,
  pages,
  newsletterText,
  newsletterPlaceholder = "Enter your email",
  newsletterButtonText = "Subscribe",
  companyName,
  textColor,
  version = "1.0",
  poweredCompany = "Aaran",
  poweredUrl = "https://my.codexsun.com/",
}) => {
  const settings = useAppSettings();
  const navigate = useNavigate();

  if (!settings) return null;

  const defaultLogo = {
    path: "/assets/logo/logo.svg",
    height: 20,
    padding: 8,
    position: "center",
    font_size: 25,
    font_subsize: 15,
    company_name: "",
    company_subname: "",
    text_color: "",
    footer_logo: "/assets/logo/logo.svg",
  };
  const logo = settings.logo || defaultLogo;
  return (
    <footer className="bg-footer text-white pt-12 pb-6">
      {/* Top Contact Section */}

      <div className="flex flex-col md:flex-row justify-evenly gap-4 px-5 lg:px-[10%]">
        {contacts.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2 border-b-2 border-ring/30 p-5 border-b-primary w-full text-sm"
            >
              <IconComponent className="w-12 h-12 p-2 shrink-0  hover:scale-110" />
              <a
                href={item.href}
                target="_blank"
                className="text-lg font-bold border-l-2 pl-2 border-primary cursor-pointer"
              >
                {item.value}
              </a>
            </div>
          );
        })}
      </div>

      {/* Main Footer */}
      <div className="lg:px-[10%] mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        {/* Company Info */}
        <div className="space-y-4">
          <div
            className={`flex items-${logo.position} gap-2 cursor-pointer`}
            onClick={() => navigate("/")}
          >
            <style>
              {`
            @media (max-width: 1024px) {
              .company-name {
                font-size: ${logo.font_size - 5}px !important; 
              }
            }
          `}
            </style>
            {/* Mode 1: Only Logo */}
            {logo.mode === "logo" && (
              <img
                src={logo.footer_logo}
                alt="Logo"
                className={`h-${logo.height} p-${logo.padding}`}
              />
            )}

            {/* Mode 2: Only Company Name */}
            {logo.mode === "name" && (
              <h3
                className={`company-name p-${logo.padding} ${textColor ? textColor : logo.text_color} font-extrabold ${logo.font}`}
                style={{ fontSize: `${logo.font_size}px` }}
              >
                {logo.company_name} <br />
                <span
                  className="company-subname font-normal"
                  style={{ fontSize: `${logo.font_subsize}px` }}
                >
                  {logo.company_subname}
                </span>
              </h3>
            )}

            {/* Mode 3: Both Logo + Company Name */}
            {logo.mode === "both" && (
              <>
                <img
                  src={logo.footer_logo}
                  alt="Logo"
                  className={`h-${logo.height} p-${logo.padding}`}
                />
                <span
                  className={`company-name flex flex-col leading-tight  ${textColor ? textColor : logo.text_color} font-extrabold ${logo.font}`}
                  style={{ fontSize: `${logo.font_size}px` }}
                >
                  {logo.company_name}
                  <span
                    className="company-subname font-normal"
                    style={{ fontSize: `${logo.font_subsize}px` }}
                  >
                    {logo.company_subname}
                  </span>
                </span>
              </>
            )}
          </div>
          <p className="leading-relaxed text-background/90">
            {address.split(",").map((line, idx, arr) => (
              <span key={idx}>
                {line.trim()}
                {idx < arr.length - 1 ? "," : "."}
                <br />
              </span>
            ))}
          </p>
          <div className="flex gap-3 mt-2">
            {socialLinks?.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-primary text-background hover:opacity-90 transition hover:scale-115"
              >
                {item.icon} <span className="sr-only">{"contact details"}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Pages */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg">Pages</h3>
          <ul className="space-y-1">
            {pages?.map((page, idx) => (
              <li key={idx}>
                <a
                  href={page.href}
                  className="text-background/90 hover:text-primary"
                >
                  {page.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-lg">Subscribe</h3>
          <p className="text-background/90">{newsletterText}</p>
          <form className="flex items-center h-max bg-white rounded-full overflow-hidden w-max md:w-full max-w-full">
            <input
              type="email"
              placeholder={newsletterPlaceholder}
              className="flex-1 min-w-0 px-4 py-2 text-gray-800 outline-none"
            />
            <Button
              type="submit"
              className="bg-primary text-sm text-primary-foreground px-3 py-2 m-1 cursor-pointer whitespace-nowrap font-medium rounded-r-full flex-shrink-0 hover:bg-hover"
            >
              {newsletterButtonText}
            </Button>
          </form>
        </div>
      </div>

      <div className="flex flex-row gap-3 mt-10 pt-4 justify-between border-t border-white/10">
        <div></div>
        <div className="text-center">
          &copy; {new Date().getFullYear()} {companyName} All rights reserved.
          Powered by
          <a href={poweredUrl} target="_blank" className="ml-1">
            {poweredCompany}
          </a>
        </div>
        <div className="block my-auto text-background/50 pr-5 cursor-pointer whitespace-nowrap">
          V {version}
        </div>
      </div>
      {/* Footer Bottom */}
      {/* <div className="text-center border-t border-ring/30 text-gray-400 mt-10 pt-4">
        &copy; {new Date().getFullYear()} {companyName} All rights reserved. 
      </div> */}
    </footer>
  );
};

export default PortfolioFooter3;
