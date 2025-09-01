import { useEffect, useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import { IoMdMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ContactHeader, { ContactItem } from "./ContactHeader";
import { useAppSettings } from "../../../apps/global/useSettings";

type MenuItem = {
  label: string;
  path: string;
};

type HeaderPortfolioProps = {
  menu: MenuItem[];
  contact: ContactItem[];
  contactHeader?: boolean;
};

function HeaderPortfolio({
  menu,
  contact,
  contactHeader = false,
}: HeaderPortfolioProps) {
  const settings = useAppSettings();
  if (!settings) return null;

  const defaultLogo = {
    path: "/assets/logo/logo.png",
    height: 20,
    padding: 8,
    position: "center",
    font_size: 25,
    font_subsize: 15,
    company_name: "",
    company_subname: "",
    text_color: "",
  };
  const logo = settings.logo || defaultLogo;

  const [menuVisible, setMenuVisible] = useState(false);
  const [showContact, setShowContact] = useState(true); // new state
  const [active, setActive] = useState(menu[0]?.path); // default = first item

  const navigate = useNavigate();

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowContact(false); // hide when scroll down
      } else {
        setShowContact(true); // show at top
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="w-full fixed top-0 left-0 z-50 shadow-md">
      {/* Contact Header – only visible on lg screens AND showContact */}
      {contactHeader && showContact && (
        <div
          className={`hidden lg:block bg-primary text-white md:px-[10%] py-1 px-5`}
        >
          <ContactHeader contacts={contact} buttonLabel="Get a Quote" />
        </div>
      )}

      {/* Logo + Menu Bar */}
      <div className="bg-background flex justify-between h-20 items-center px-5  py-2 md:py-4">
        {/* Logo */}
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
              src={logo.path}
              alt="Logo"
              className={`h-${logo.height} p-${logo.padding}`}
            />
          )}

          {/* Mode 2: Only Company Name */}
          {logo.mode === "name" && (
            <h3
              className={`company-name p-${logo.padding} ${logo.text_color} font-extrabold ${logo.font}`}
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
                src={logo.path}
                alt="Logo"
                className={`h-${logo.height} p-${logo.padding}`}
              />
              <span
                className={`company-name flex flex-col leading-tight ${logo.text_color} font-extrabold ${logo.font}`}
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

        {/* Desktop Menu */}

        <ul className="hidden md:flex flex-row justify-between gap-10 items-center">
          {menu.map((item) => (
            <li key={item.path} className="relative group">
              <ScrollLink
                to={item.path}
                smooth
                duration={600}
                offset={-70}
                spy
                onClick={() => setActive(item.path)}
                onSetActive={() => setActive(item.path)}
                className={`cursor-pointer text-lg transition-all duration-200 ${
                  active === item.path
                    ? "text-primary border-b-4 border-b-primary font-bold"
                    : "text-foreground hover:text-hover"
                }`}
              >
                {item.label}
              </ScrollLink>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Icon */}
        <div
          className="flex md:hidden"
          onClick={() => setMenuVisible(!menuVisible)}
        >
          <IoMdMenu size={25} />
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <ul
        className={`md:hidden fixed inset-0 transform transition-all duration-300 ease-in-out flex flex-col gap-5 bg-black text-gray-50 p-4 z-50 ${
          menuVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        {/* Close icon */}
        <div
          className="absolute right-0 top-0 mt-10 mr-5"
          onClick={() => setMenuVisible(false)}
        >
          <IoClose size={25} />
        </div>

        {/* Mobile Links */}
        <div className="flex flex-col mt-16">
          {menu.map((item) => (
            <ScrollLink
              key={item.path}
              to={item.path}
              smooth
              duration={600}
              offset={-70}
              onClick={() => setMenuVisible(false)}
              className="border-b w-full border-gray-500 p-2 mt-5 hover:text-[#23aa70] last:border-b-0 cursor-pointer"
            >
              {item.label}
            </ScrollLink>
          ))}
        </div>
      </ul>
    </header>
  );
}

export default HeaderPortfolio;
