import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LucideShoppingCart, UserCircle2 } from "lucide-react";
import GlobalSearch from "../../components/input/search-box";
import ImageButton from "../../components/button/ImageBtn";
import { ModeToggle } from "../../components/mode-toggle";
import { useAppSettings } from "../../../resources/global/useSettings";
import { useAuth } from "../../../resources/global/auth/AuthContext";
import UserSubMenu from "../../UIBlocks/UserSubMenu";

function EcartHeader() {
  const settings = useAppSettings();
  if (!settings) return null;

  const defaultLogo = {
    path: "/logo.png",
    height: 40,
    padding: 8,
    position: "center",
    font_size: 2,
    company_name: "Tech Media",
    mode: "logo",
    font: 20,
    text_color: "",
    company_subname: "",
    font_subsize: 20,
  };

  const logo = settings.logo || defaultLogo;

  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null!);
  const showTimer = useRef<NodeJS.Timeout | null>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const showLabel = windowWidth > 600;

  const { logout, user } = useAuth(); // useAuth hook

  const menu = [
    { label: "My Profile", path: "/profile", icon: "user" },
    { label: "My Orders", path: "/orders", icon: "plus" },
    { label: "Wishlist", path: "/wishlist", icon: "like" },
    { label: "Logout", path: "/", icon: "logout" },
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userSearchHistory");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const handleLoginMouseEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setShowLoginDropdown(true), 200);
  };

  const handleLoginMouseLeave = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setShowLoginDropdown(false), 300);
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    if (!value.trim()) return setResults([]);
    const fakeResults = [
      `Result for "${value}" #1`,
      `Result for "${value}" #2`,
      `Result for "${value}" #3`,
    ];
    setResults(fakeResults);
  };

  const saveToHistory = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!history.includes(trimmed)) {
      const updated = [trimmed, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem("userSearchHistory", JSON.stringify(updated));
    }
  };

  return (
    <header className="sticky top-0 z-50 sm:px-5 bg-background border-b border-ring/30 shadow-lg">
      {showMobileSearch ? (
        <div className="flex justify-end p-2 gap-2 w-full">
          <GlobalSearch
            className="flex-1 w-full"
            onSearchApi={""}
            onNavigate={function (path: string): void {
              throw new Error("Function not implemented.");
            }}
          />
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
            onClick={() => navigate("/")}
          >
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
                className={`text-${logo.font_size}xl p-${logo.padding} font-bold`}
              >
                {logo.company_name}
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
                <span className={`text-${logo.font_size}xl font-bold`}>
                  {logo.company_name}
                </span>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3 flex-1 justify-end lg:gap-5 p-2">
            {/* Desktop Search */}
            <div className="hidden sm:block">
              <GlobalSearch
                className="flex-1 md:min-w-[300px] lg:min-w-[500px]"
                onSearchApi={""}
                onNavigate={function (path: string): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </div>

            {/* Mobile Search Icon */}
            <div className="flex sm:hidden items-center gap-2">
              <ImageButton
                icon="search"
                onClick={() => setIsOpen(true)}
                className="border border-ring/30 p-2"
              />
            </div>

            {/* Search Modal */}
            {isOpen && (
              <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-20">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      ref={inputRef}
                      className="w-full border border-gray-300 rounded px-4 py-2"
                      placeholder="Search..."
                      value={query}
                      onChange={(e) => handleSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveToHistory(query);
                          navigate(`/search?q=${query}`);
                          setIsOpen(false);
                        }
                      }}
                    />
                    <ImageButton
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded border border-delete text-delete hover:bg-gray-100"
                      icon={"close"}
                    />
                  </div>

                  {results.length > 0 && (
                    <div className="bg-gray-50 border rounded p-3 space-y-2">
                      {results.map((result, index) => (
                        <div
                          key={index}
                          className="hover:bg-gray-200 cursor-pointer px-2 py-1 rounded"
                          onClick={() => {
                            saveToHistory(query);
                            navigate(`/search?q=${query}`);
                            setIsOpen(false);
                          }}
                        >
                          {result}
                        </div>
                      ))}
                    </div>
                  )}

                  {history.length > 0 && (
                    <div className="text-sm text-gray-500 mt-2">
                      <div className="font-medium text-gray-600 mb-1">
                        Search History
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {history.map((item, idx) => (
                          <div
                            key={idx}
                            className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                            onClick={() => {
                              handleSearch(item);
                              saveToHistory(item);
                            }}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Authenticated UI */}
            {user ? (
              <>
                {/* Cart */}
                <div
                  className="flex items-center gap-2 text-md text-foreground/80 cursor-pointer"
                  onClick={() => navigate("/cart")}
                >
                  <LucideShoppingCart size={25} />
                  {showLabel && "Cart"}
                </div>

                {/* User Dropdown */}
                <div
                  className="relative flex items-center gap-2 text-md text-foreground/80 cursor-pointer"
                  ref={loginRef}
                  onMouseEnter={handleLoginMouseEnter}
                  onMouseLeave={handleLoginMouseLeave}
                >
                  <UserCircle2 size={30} />

                  <UserSubMenu
                    anchorRef={loginRef}
                    visible={showLoginDropdown}
                    content={
                      <div className="w-[220px] flex flex-col rounded-md bg-background shadow-xl ring-1 ring-ring/30 p-2 space-y-1 text-sm transform duration-500">
                        {menu.map((item, idx) => (
                          <ImageButton
                            key={idx}
                            className="hover:bg-accent p-2 rounded cursor-pointer"
                            icon={item.icon}
                            label={item.label}
                            onClick={async () => {
                              if (item.label === "Logout") {
                                await logout();
                                navigate("/");
                              } else {
                                navigate(item.path);
                                setShowLoginDropdown(false);
                              }
                            }}
                          />
                        ))}
                      </div>
                    }
                  />
                </div>
              </>
            ) : (
              // If not authenticated
              <div
                className="flex items-center gap-2 text-md text-foreground/80 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                <UserCircle2 size={25} />
                {showLabel && "Login"}
              </div>
            )}

            {/* Dark Mode Toggle */}
            <div className="hidden sm:block">
              <ModeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default EcartHeader;
