import ImageButton from "../../../resources/components/button/ImageBtn";
import DropdownRead from "../../../resources/components/input/dropdown-read";
import Checkbox from "../../../resources/components/input/checkbox";
import { FiltersType } from "../../../resources/ecart/src/pages/CategoryPage";

type DropdownType = {
  id: string;
  label: string;
  options: string[];
  readApi?: string; // optional API source for DropdownRead
  apiKey?: string; // optional API key to extract data
};

type PriceRange = {
  id: number;
  label: string;
  min: number;
  max: number;
};

type FilterProps = {
  dropdowns: DropdownType[];
  selectedFilters: FiltersType;
  setSelectedFilters: React.Dispatch<React.SetStateAction<FiltersType>>;
  maxPrice: number;
  selectedPriceRange: number | null;
  setSelectedPriceRange: React.Dispatch<React.SetStateAction<number | null>>;
  onClose: () => void;
};

const MobileFilter = ({
  dropdowns,
  selectedFilters,
  setSelectedFilters,
  maxPrice,
  selectedPriceRange,
  setSelectedPriceRange,
  onClose,
}: FilterProps) => {
  // same price range calculation as desktop
  const priceRanges: PriceRange[] = [
    {
      id: 1,
      label: `Up to ₹ ${Math.round(maxPrice * 0.25)}`,
      min: 0,
      max: maxPrice * 0.25,
    },
    {
      id: 2,
      label: `₹ ${Math.round(maxPrice * 0.25)} - ₹ ${Math.round(maxPrice * 0.5)}`,
      min: maxPrice * 0.25,
      max: maxPrice * 0.5,
    },
    {
      id: 3,
      label: `₹ ${Math.round(maxPrice * 0.5)} - ₹ ${Math.round(maxPrice * 0.75)}`,
      min: maxPrice * 0.5,
      max: maxPrice * 0.75,
    },
    {
      id: 4,
      label: `₹ ${Math.round(maxPrice * 0.75)} - ₹ ${Math.round(maxPrice * 0.9)}`,
      min: maxPrice * 0.75,
      max: maxPrice * 0.9,
    },
    {
      id: 5,
      label: `Above ₹ ${Math.round(maxPrice * 0.9)}`,
      min: maxPrice * 0.9,
      max: Infinity,
    },
  ];

  return (
    <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h6 className="font-semibold text-lg">Filters</h6>
        <ImageButton
          className="text-xl font-bold"
          onClick={onClose}
          icon={"close"}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Dropdowns */}
        <div className="flex flex-col gap-4">
          {dropdowns.map((dropdown) => (
            <div key={dropdown.id} className="w-full">
              <DropdownRead
                id={dropdown.id}
                label={dropdown.label}
                items={dropdown.options}
                value={selectedFilters[dropdown.id as keyof FiltersType] || ""}
                onChange={(val) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    [dropdown.id]: Array.isArray(val) ? val[0] || "" : val,
                  }))
                }
                err=""
                multiple={false}
                readApi={dropdown.readApi}
                apiKey={dropdown.apiKey}
              />
              {selectedFilters[dropdown.id as keyof FiltersType] && (
                <button
                  className="text-xs text-blue-600 underline mt-1"
                  onClick={() =>
                    setSelectedFilters((prev) => ({
                      ...prev,
                      [dropdown.id]: "",
                    }))
                  }
                >
                  Clear
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Price filter */}
        <div className="mt-6">
          <label className="text-md font-semibold">Price</label>
          <div className="flex flex-col gap-2 mt-2">
            {priceRanges.map((range) => (
              <Checkbox
                key={range.id}
                id={`price-${range.id}`}
                agreed={selectedPriceRange === range.id}
                label={range.label}
                err={""} // or your error message if you have validation
                className=""
                onChange={(checked) =>
                  setSelectedPriceRange(() => (checked ? range.id : null))
                }
              />
            ))}
          </div>
        </div>

        {/* Other filters */}
        {/* <div className="flex flex-col gap-3 mt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={invoice}
              onChange={() => setInvoice(!invoice)}
            />
            GST Invoice
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={availability}
              onChange={() => setAvailability(!availability)}
            />
            Include Out of Stock
          </label>
        </div> */}
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <button
          className="w-full bg-primary text-white p-2 rounded"
          onClick={onClose}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default MobileFilter;
