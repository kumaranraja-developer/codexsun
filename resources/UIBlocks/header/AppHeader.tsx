import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "../../../apps/global/useSettings";
import ImageButton from "../../../resources/components/button/ImageBtn";
import {ModeToggle} from "../../../resources/components/mode-toggle";

function AppHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const settings = useAppSettings();
  const logo = settings.logo;

  // Load search history on mount
  useEffect(() => {
    const stored = localStorage.getItem("searchHistory");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100); // Focus search
      }

      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search filtering logic
  const handleSearch = (value: string) => {
    setQuery(value);
    if (!value.trim()) return setResults([]);

    // Example results (replace with real API)
    const fakeResults = [
      `Result for "${value}" #1`,
      `Result for "${value}" #2`,
      `Result for "${value}" #3`,
    ];
    setResults(fakeResults);
  };

  // Save only on submit actions
  const saveToHistory = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (!history.includes(trimmed)) {
      const updated = [trimmed, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem("searchHistory", JSON.stringify(updated));
    }
  };

  return (
    <header className="sticky top-0 z-50 sm:px-5 bg-background border-b border-ring/30">
      {/* --- Top Bar --- */}
      <div className="flex items-center justify-between gap-5">
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

        {/* Right Section */}
        <div className="flex items-center gap-3 flex-1 justify-end lg:gap-5 p-2">
          <ImageButton
            icon="search"
            label="Ctrl + K"
            onClick={() => setIsOpen(true)}
            fontSize="text-sm"
            className="border text-foreground/70 border-ring/40 p-1"
          />
          <div className="hidden sm:block">
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* --- Command Palette Popup --- */}
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

            {/* Results */}
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

            {/* History */}
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
    </header>
  );
}

export default AppHeader;
