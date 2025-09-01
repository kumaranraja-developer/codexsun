import { useState } from "react";

interface AccordionData {
  question: string;
  answer: string | AccordionData[];
}

interface NestedAccordionProps {
  title?: string;
  items: AccordionData[];
}

export default function NestedAccordion({ title, items }: NestedAccordionProps) {
  return (
    <div className="space-y-2">
      {title && (
        <div className="font-semibold text-lg text-foreground py-2">{title}</div>
      )}

      <div className="rounded-lg border border-border divide-y divide-border bg-background text-foreground">
        <AccordionGroup items={items} />
      </div>
    </div>
  );
}

function AccordionGroup({ items }: { items: AccordionData[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="hs-accordion-group">
      {items.map((item, index) => {
        const id = `${item.question}-${index}`;
        const isOpen = openId === id;
        const hasChildren = Array.isArray(item.answer);

        return (
          <div key={id} className={`hs-accordion ${isOpen ? "active" : ""}`}>
            <button
              className="hs-accordion-toggle py-3 px-4 inline-flex items-center gap-x-3 w-full font-medium text-start text-foreground hover:text-foreground/90 transition-colors"
              aria-expanded={isOpen}
              aria-controls={`collapse-${id}`}
              onClick={() => setOpenId(isOpen ? null : id)}
            >
              {isOpen ? <MinusIcon size={16} /> : <PlusIcon size={16} />}
              {item.question}
            </button>

            <div
              id={`collapse-${id}`}
              className={`hs-accordion-content transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "block" : "hidden"
              }`}
              role="region"
              aria-labelledby={`heading-${id}`}
            >
              {hasChildren ? (
                <div className="ml-5">
                  <AccordionGroup items={item.answer as AccordionData[]} />
                </div>
              ) : (
                <div className="px-4 pb-4 pl-10 text-foreground/70">
                  <em>{item.answer as any}</em>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Icons
function PlusIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function MinusIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
    </svg>
  );
}
