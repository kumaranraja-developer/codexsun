import { useRef, useState } from "react";

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  title?: string;
  items: AccordionItem[];
  type?: "cross" | "chevron" | "plus";
  titleStyle?: string;
  cardStyle?: string;
}

export default function Accordion({
  title,
  items,
  type = "cross",
  titleStyle,
  cardStyle
}: AccordionProps) {
  const [activeAccordion, setActiveAccordion] = useState<string>("");
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const toggleAccordion = (id: string) => {
    setActiveAccordion((prev) => (prev === id ? "" : id));
  };

  return (
    <div>
      {title && (
        <div className={`font-bold text-center ${titleStyle}`}>{title}</div>
      )}

      <div
        className={`relative w-full mx-auto overflow-hidden text-sm font-normal border border-border divide-y divide-border rounded-md ${cardStyle}`}
      >
        {items.map((item, index) => {
          const id = `accordion-${index}`;
          const isActive = activeAccordion === id;

          return (
            <div key={id} className="cursor-pointer group">
              <button
                onClick={() => toggleAccordion(id)}
                className="flex items-center justify-between w-full p-4 text-left select-none transition-colors"
              >
                <span className="font-semibold text-lg cursor-pointer">{item.question}</span>

                {/* Icon variants */}
                {type === "chevron" && (
                  <svg
                    className={`w-4 h-4 duration-200 ease-out transform cursor-pointer ${
                      isActive ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}

                {type === "plus" && (
                  <div
                    className={`relative flex items-center justify-center w-2.5 h-2.5 duration-300 ease-out cursor-pointer ${
                      isActive ? "rotate-90" : ""
                    }`}
                  >
                    <div className="absolute w-0.5 h-full bg-foreground group-hover:bg-foreground/90 rounded-full"></div>
                    <div
                      className={`absolute w-full h-0.5 duration-500 ease bg-foreground group-hover:bg-foreground/90 rounded-full ${
                        isActive ? "rotate-90" : ""
                      }`}
                    ></div>
                  </div>
                )}

                {type === "cross" && (
                  <svg
                    className={`w-5 h-5 transform duration-300 ease-out origin-center cursor-pointer ${
                      isActive ? "rotate-45" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m6-6H6"
                    />
                  </svg>
                )}
              </button>

              <div
                ref={(el) => {
                  contentRefs.current[id] = el;
                }}
                style={{
                  maxHeight: isActive
                    ? `${contentRefs.current[id]?.scrollHeight}px`
                    : "0px",
                }}
                className="transition-all duration-300 ease-in-out overflow-hidden"
              >
                <div className="p-4 pt-0 opacity-80 cursor-default">{item.answer}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
