import { useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import { IoMdMenu } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button/Button";
import { useInView } from "react-intersection-observer";
import { useAppSettings } from "../../../apps/global/useSettings";

type MenuItem = {
  label: string;
  path: string;
};

type TransparentHeaderProps = {
  menu: MenuItem[];
};

function TransparentHeader({ menu }: TransparentHeaderProps) {
  const settings = useAppSettings();
  if (!settings) return null;

  const defaultLogo = {
    path: "/assets/logo/logo.png",
    height: 20,
    padding: 8,
    position: "center",
    font_size: 2,
    company_name: "",
    text_color: "",
  };

  const logo = settings.logo || defaultLogo;
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();

  const [menuref, inView] = useInView({ triggerOnce: false, threshold: 0.1 });

  return (
   <div className="fixed top-0 left-0 w-full bg-background/30 backdrop-blur-md lg:px-[12%] flex flex-row justify-between h-20 items-center px-5 py-2 md:py-4 z-50">
 {/* <div className="bg-background/0 lg:px-[12%] flex flex-row justify-between h-20 items-center px-5 py-2 md:py-4 w-full z-50"></div> */}
      {/* Logo */}
      <div
        ref={menuref}
        className={`flex items-${logo.position} gap-2 cursor-pointer ${inView ? "animate__animated animate__fadeInLeft" : ""}`}
        onClick={() => navigate("/")}
      >
        {logo.mode === "logo" && (
          <img
            src={logo.path}
            alt="Logo"
            style={{
              height: `${logo.height}px`,
              padding: `${logo.padding}px`,
            }}
          />
        )}

        {logo.mode === "name" && (
          <h3
            style={{
              fontSize: `${logo.font_size}rem`,
              padding: `${logo.padding}px`,
            }}
            className="font-bold"
          >
            {logo.company_name}
          </h3>
        )}

        {logo.mode === "both" && (
          <>
            <img
              src={logo.path}
              alt="Logo"
              style={{
                height: `${logo.height}px`,
                padding: `${logo.padding}px`,
              }}
            />
            <span
              style={{
                fontSize: `${logo.font_size}rem`,
              }}
              className="font-bold"
            >
              {logo.company_name}
            </span>
          </>
        )}
      </div>

      {/* Desktop Menu */}
      <ul
        ref={menuref}
        className={`hidden md:flex flex-row bg-primary/10 justify-between gap-10 items-center ring-2 ring-background/60 p-2 px-4 rounded-full shadow-[0_8px_15px_3px_rgba(0,0,0,0.2)] hover:scale-105 ${inView ? " animate__animated animate__fadeInDown" : ""}`}
      >
        {menu.map((item) => (
          <li
            key={item.path}
            className="relative group overflow-hidden h-[1.5rem]"
          >
            <ScrollLink
              to={item.path}
              smooth={true}
              duration={600}
              offset={-70}
              spy={true}
              activeClass=""
              className="block relative cursor-pointer"
            >
              {/* Original text */}
              <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                {item.label}
              </span>

              {/* Hover text */}
              <span className="absolute top-full left-0 w-full text-primary block transition-transform duration-300 group-hover:translate-y-[-100%]">
                {item.label}
              </span>
            </ScrollLink>
          </li>
        ))}
      </ul>
      <Button
        ref={menuref}
        label="Get Started"
        className={`hidden md:block bg-primary/10 ring-2 ring-background/60 p-2 px-4 !rounded-full shadow-[0_8px_15px_3px_rgba(0,0,0,0.2)] hover:scale-105  ${inView ? "animate__animated animate__fadeInRight" : ""}`}
      />
      {/* Mobile Menu Icon */}
      <div
        className="flex md:hidden"
        onClick={() => setMenuVisible(!menuVisible)}
      >
        <IoMdMenu size={25} />
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
              smooth={true}
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
    </div>
  );
}

export default TransparentHeader;
