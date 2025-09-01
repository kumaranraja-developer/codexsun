import { cn } from "../../../resources/global/library/utils";
import type { Product } from "../header/Header";
import apiClient from "../../../resources/global/api/apiClients";
import { useAppContext } from "../../../apps/global/AppContaxt";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface GlobalSearchProps {
  className?: string;
  onSearchApi: string;
  onNavigate: (path: string) => void;
}

export default function GlobalSearch({
  className = "",
  onSearchApi,
  onNavigate,
}: GlobalSearchProps) {
  const { API_URL } = useAppContext();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // Load recent searches from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(stored);
  }, []);

  // Close dropdown when clicking outside and disable background scroll
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowResults(false); // Close the dropdown
      }
    };

    if (showResults) {
      document.body.classList.add("overflow-hidden"); // Disable background scroll
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.classList.remove("overflow-hidden"); // Re-enable background scroll
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.body.classList.remove("overflow-hidden"); // Cleanup on unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showResults]);

  const handleSearch = (value: string) => {
    setQuery(value);
    setShowResults(true);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      if (!value.trim()) {
        setResults([]);
        return;
      }

      try {
        // Split by space and remove empty words
        const keywords = value
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0);

        // Build filters: each keyword must match the name
        // [["name","like","%Dell%"], ["name","like","%i5%"], ...]
        const filtersArray = keywords.map((word) => [
          "name",
          "like",
          `%${word}%`,
        ]);

        const filtersParam = `filters=${encodeURIComponent(
          JSON.stringify(filtersArray)
        )}`;

        const url = `${onSearchApi}${
          onSearchApi.includes("?") ? "&" : "?"
        }${filtersParam}`;

        const res = await apiClient.get(url);

        setResults(
          (res.data?.data || []).map((item: any) => ({
            id: item.name,
            name: item.name,
            imageUrl: item.image_1,
            price: item.price || item.standard_rate || 0,
          }))
        );
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      }
    }, 300);
  };

  const handleSelect = (product: Product) => {
    // Save to recent searches (avoid duplicates by id)
    let updated = [
      product,
      ...recentSearches.filter((p) => p.id !== product.id),
    ].slice(0, 5);

    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    onNavigate(`/productpage/${product.id}`);
    setQuery("");
    setShowResults(false); // Close dropdown
  };

  const handleShowAll = () => {
    navigate("/category/");
  };
  
  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none z-10">
          <svg
            className="size-4 text-gray-400 dark:text-white/60"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={query}
          onFocus={() => setShowResults(true)}
          onChange={(e) => handleSearch(e.target.value)}
          className={cn(
            "py-2.5 ps-10 pe-4 block w-full rounded-lg border border-ring/30 sm:text-sm",
            "focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent",
            "transition duration-300",
            className
          )}
        />
      </div>

      {/* Dropdown */}
      {showResults && (
        <div className="absolute bg-white rounded w-full mt-1 max-h-[450px] overflow-y-auto shadow-lg z-50">
          {/* Recent Searches */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="border border-ring/30">
              <div className="px-2 py-1 text-xs text-gray-500">
                Recent Searches
              </div>
              {recentSearches.map((product, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-5 p-2 group hover:bg-primary/10 hover:text-primary hover:font-semibold transform transition-all duration-300 ease-in-out cursor-pointer border-b border-ring/30 last:border-0"
                  onClick={() => handleSelect(product)}
                >
                  {product.imageUrl && (
                    <img
                      src={`${API_URL}/${product.imageUrl}`}
                      alt={product.name}
                      className="w-12 lg:w-18 h-12 lg:h-18 object-contain rounded"
                    />
                  )}
                  <span className="text-foreground/50 group-hover:text-primary transition-all duration-500 ease-in-out line-clamp-2">
                    {product.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {query.trim() && results.length > 0 && (
            <div className="relative border border-ring/30">
              {/* Scrollable area */}
              <div className="max-h-64 overflow-y-auto">
                {results.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-5 p-2 group hover:bg-primary/10 hover:font-semibold transform transition-all duration-300 cursor-pointer border-b border-ring/30 last:border-0"
                    onClick={() => handleSelect(product)}
                  >
                    {product.imageUrl && (
                      <img
                        src={`${API_URL}/${product.imageUrl}`}
                        alt={product.name}
                        className="w-12 lg:w-18 h-12 lg:h-18 object-contain rounded"
                      />
                    )}
                    <span className="text-foreground/70 group-hover:text-primary line-clamp-2">
                      {product.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Fixed button at the bottom */}
              <div className="sticky bottom-0 bg-background border-t border-ring/30">
                <button
                  onClick={() => {
                    handleShowAll();
                    setQuery("");
                    setShowResults(false);
                  }}
                  className="w-full text-primary font-medium hover:underline cursor-pointer p-2 hover:bg-primary/10"
                >
                  Show All
                </button>
              </div>
            </div>
          )}

          {/* No results */}
          {query.trim() && results.length === 0 && (
            <div className="p-2 text-sm text-gray-500">
              No matching products found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
