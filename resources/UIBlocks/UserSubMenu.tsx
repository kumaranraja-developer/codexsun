import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface InvisibleSectionProps {
  anchorRef: React.RefObject<HTMLDivElement>;
  content: ReactNode;
  visible: boolean;
}

function UserSubMenu({ anchorRef, content, visible }: InvisibleSectionProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (anchorRef.current && visible) {
      const rect = anchorRef.current.getBoundingClientRect();
      const margin = 8;
      const top = rect.bottom + window.scrollY + margin;

      requestAnimationFrame(() => {
        const dropdownEl = dropdownRef.current;
        if (dropdownEl) {
          const dropdownWidth = dropdownEl.offsetWidth;
          let left = rect.left + rect.width / 2 + window.scrollX - dropdownWidth / 2;

          // Prevent overflow right
          if (left + dropdownWidth + margin > window.innerWidth) {
            left = window.innerWidth - dropdownWidth - margin;
          }

          // Prevent overflow left
          if (left < margin) {
            left = margin;
          }

          setPosition({ top, left });
        }
      });
    }
  }, [anchorRef, visible]);

  if (!visible) return null;

  return createPortal(
  <div
    ref={dropdownRef}
    className="absolute z-[100000] bg-background border border-ring/30 rounded-md shadow-lg text-sm min-w-[200px] max-w-[calc(100vw-20px)] max-h-[60vh] overflow-y-hidden"
    style={{
      top: position.top,
      left: position.left,
      position: "absolute",
    }}
  >
    {content}
  </div>,
  document.body
);

}

export default UserSubMenu;
