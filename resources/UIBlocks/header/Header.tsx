import { useState, useEffect, useRef } from "react";
import { LucideShoppingCart, UserCircle2 } from "lucide-react";
import UserSubMenu from "../../../resources/UIBlocks/UserSubMenu";
import ImageButton from "../../../resources/components/button/ImageBtn";
import GlobalSearch from "../../../resources/components/input/search-box";

export type Product = {
  id: string;
  name: string;
  imageUrl?: string;
  price?: number;
};

type LogoType = {
  path: string;
  height: number;
  padding: number;
  position: "left" | "center" | "right";
  font_size: number;
  company_name: string;
  mode?: "logo" | "name" | "both";
};

type MenuItem = {
  label: string;
  path: string;
  icon: string;
  onClick?: () => void;
};

type HeaderProps = {
  logo: LogoType;
  showLogin: boolean;
  user: any | null;
  logout: () => void;
  menuItems: MenuItem[];
  showSearch: boolean;
  onSearchApi: string;
  onNavigate: (path: string) => void;
  showMobileSearchInitial?: boolean;
};

export default function Header({
  logo,
  showLogin,
  user,
  logout,
  menuItems,
  showSearch,
  onSearchApi,
  onNavigate,
  showMobileSearchInitial = false,
}: HeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(
    showMobileSearchInitial
  );
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null!);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const showLabel = windowWidth > 600;
  const [isOpen, setIsOpen] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLoginMouseEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    setShowLoginDropdown(true);
  };

  const handleLoginMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setShowLoginDropdown(false);
    }, 300); // Delay before closing the dropdown (300ms)
  };

  const handleMenuClick = async (item: MenuItem) => {
    if (item.label === "Logout") {
      await logout();
      onNavigate("/");
    } else if (item.path) {
      onNavigate(item.path);
    }
    setShowLoginDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setShowLoginDropdown(false);
      }
    };

    const handleScroll = () => {
      setShowLoginDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 sm:px-5 bg-background border-b border-ring/30 shadow-lg">
      {showMobileSearch ? (
        <div className="flex justify-end p-2 gap-2 w-full">
          {showSearch && (
            <GlobalSearch onSearchApi={onSearchApi} onNavigate={onNavigate} />
          )}
          <ImageButton
            icon="close"
            onClick={() => setShowMobileSearch(false)}
            className="border border-ring/30 p-2"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-5">
          {/* Logo */}
          <div
            className={`flex items-${logo.position} gap-2 cursor-pointer`}
            onClick={() => onNavigate("/")}
          >
            {logo.mode === "logo" && (
              <img
                src={logo.path}
                alt="Logo"
                className={`h-${logo.height} p-${logo.padding}`}
              />
            )}
            {logo.mode === "name" && (
              <h3
                className={`text-${logo.font_size}xl p-${logo.padding} font-bold`}
              >
                {logo.company_name}
              </h3>
            )}
            {logo.mode === "both" && (
              <>
                <img
                  src={logo.path}
                  alt="Logo"
                  className={`h-${logo.height} p-${logo.padding}`}
                />
                <span className={`text-${logo.font_size}xl font-bold`}>
                  {logo.company_name}
                </span>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 flex-1 justify-end lg:gap-5 p-2">
            {/* Desktop Search */}
            {showSearch && (
              <div className="hidden sm:block w-full max-w-lg">
                <GlobalSearch
                  onSearchApi={onSearchApi}
                  onNavigate={onNavigate}
                />
              </div>
            )}

            {/* Mobile Search Icon */}
            {showSearch && (
              <div className="flex sm:hidden items-center gap-2">
                <ImageButton
                  icon="search"
                  onClick={() => setIsOpen(true)}
                  className="border border-ring/30 p-2"
                />
              </div>
            )}

            {/* Mobile Search Modal */}
            {isOpen && (
              <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center p-2">
                <div className="bg-white flex justify-center gap-2 rounded-sm shadow-lg w-full max-w-xl p-5 space-y-4">
                  <div className="flex-1">
                    <GlobalSearch
                      onSearchApi={onSearchApi}
                      onNavigate={(path) => {
                        onNavigate(path);
                        setIsOpen(false);
                      }}
                    />
                  </div>
                  <div>
                    <ImageButton
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded border border-delete text-delete mt-1 hover:bg-gray-100"
                      icon={"close"}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* User / Cart */}
            {showLogin && user ? (
              <>
                <div
                  className="flex items-center gap-2 cursor-pointer hover:scale-110 transition-transform duration-200"
                  onClick={() => onNavigate("/cart")}
                >
                  <LucideShoppingCart size={25} />
                  {showLabel && "Cart"}
                </div>
                <div
                  className="relative flex items-center gap-2 cursor-pointer"
                  ref={loginRef}
                  onMouseEnter={
                    windowWidth > 768 ? handleLoginMouseEnter : undefined
                  }
                  onMouseLeave={
                    windowWidth > 768 ? handleLoginMouseLeave : undefined
                  }
                  onClick={() => {
                    if (windowWidth <= 768) {
                      setShowLoginDropdown((prev) => !prev);
                    }
                  }}
                >
                  <UserCircle2 className="hover:scale-110 transition-transform duration-200" size={30} />
                  <UserSubMenu
                    anchorRef={loginRef}
                    visible={showLoginDropdown}
                    content={
                      <div className="w-[220px] flex flex-col rounded-md bg-background shadow-xl ring-1 ring-ring/30 p-2 space-y-1 text-sm">
                        {menuItems.map((item, idx) => (
                          <ImageButton
                            key={idx}
                            icon={item.icon}
                            label={item.label}
                            onClick={() => handleMenuClick(item)}
                            className="py-2 px-2 hover:bg-primary/10"
                          />
                        ))}
                      </div>
                    }
                  />
                </div>
              </>
            ) : showLogin ? (
              <div
                className="flex items-center gap-2 cursor-pointer hover:scale-110 transition-transform duration-200"
                onClick={() => onNavigate("/login")}
              >
                <UserCircle2 size={25} />
                {showLabel && "Login"}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}