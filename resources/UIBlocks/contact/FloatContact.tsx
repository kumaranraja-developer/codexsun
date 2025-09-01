import React, { useState, useEffect } from "react";
interface ContactType {
  id: "whatsapp" | "phone" | "email" | "instagram" | string;
  contact: string;
  imgPath: string;
  defaultMessage?: string;
  className?: string;
}

interface FloatContactProps {
  contacts: ContactType[];
  className?: string;
  horizontal?: boolean;
  labelPosition?: "left" | "right" | "top" | "bottom";
  iconSize?:string
}

const platformColors: Record<string, string> = {
  whatsapp: "#25D366",
  phone: "#00CCFF",
  email: "#8F1F8D",
  instagram: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)",
};

function FloatContact({
  contacts,
  className,
  horizontal = false,
  labelPosition = "left",
  iconSize="w-12 h-12"
}: FloatContactProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [canHover, setCanHover] = useState(false);

  // Detect if device supports hover
  useEffect(() => {
    const hoverMq = window.matchMedia("(hover: hover)");
    setCanHover(hoverMq.matches);
    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches);
    hoverMq.addEventListener("change", handler);
    return () => hoverMq.removeEventListener("change", handler);
  }, []);

  const handleClick = (contact: ContactType) => {
    if (contact.id === "whatsapp") {
      let url = "";

      if (contact.id === "whatsapp") {
        const encodedMsg = encodeURIComponent(contact.defaultMessage || "");
        let url = "";

        if (/^https?:\/\//.test(contact.contact)) {
          // Clean existing link and always append message if provided
          url = contact.contact.includes("?")
            ? `${contact.contact}&text=${encodedMsg}`
            : `${contact.contact}?text=${encodedMsg}`;
        } else {
          // Clean number (remove +, spaces, dashes, etc.)
          const cleanedNumber = contact.contact.replace(/\D/g, "");
          url = `https://wa.me/${cleanedNumber}${encodedMsg ? `?text=${encodedMsg}` : ""}`;
        }

        console.log("Opening WhatsApp URL:", url);

        // For mobile, use location.href so message is not lost
        if (/Mobi|Android/i.test(navigator.userAgent)) {
          window.location.href = url;
        } else {
          window.open(url, "_blank");
        }
      }

      console.log("Opening WhatsApp URL:", url);
      window.open(url, "_blank");
    } else if (contact.id === "instagram") {
      let url = contact.contact;

      // If it's not already a full URL, build a profile link
      if (!/^https?:\/\//.test(url)) {
        url = `https://www.instagram.com/${url.replace(/^@/, "")}/`;
      }

      // If defaultMessage is provided, append as DM link (works on web & mobile)
      if (contact.defaultMessage) {
        const encodedMsg = encodeURIComponent(contact.defaultMessage);
        url = `https://www.instagram.com/direct/new/?text=${encodedMsg}`;
      }

      window.open(url, "_blank");
    } else if (contact.id === "phone") {
      window.location.href = `tel:${contact.contact}`;
    } else if (contact.id === "email") {
      const subject = encodeURIComponent("Product Inquiry");
      const body = encodeURIComponent(contact.defaultMessage || "");
      const url = `mailto:${contact.contact}?subject=${subject}${
        body ? `&body=${body}` : ""
      }`;
      window.location.href = url;
    } else {
      console.warn(`No handler for contact type: ${contact.id}`);
    }
  };

  return (
    <div
      className={`flex ${horizontal ? "flex-row" : "flex-col"} gap-8 ${className}`}
    >
      {contacts.map((item) => (
        <div key={item.id} className="relative flex items-center">
          {/* Tooltip */}
          {hoveredId === item.id && canHover && (
            <span
              className={`absolute px-3 py-1 text-white text-sm rounded-md whitespace-nowrap transition-all duration-300
                ${
                  labelPosition === "left"
                    ? "right-14"
                    : labelPosition === "right"
                      ? "left-14"
                      : labelPosition === "top"
                        ? "bottom-full mb-2"
                        : "top-full mt-2"
                }`}
              style={{
                background: platformColors[item.id] || "rgba(0,0,0,0.7)",
              }}
            >
              {item.contact}
            </span>
          )}

          {/* Icon button */}
          <button
            onClick={() => {
              setHoveredId(null); // hide tooltip immediately on click/tap
              handleClick(item);
            }}
            onMouseEnter={() => canHover && setHoveredId(item.id)}
            onMouseLeave={() => canHover && setHoveredId(null)}
            onTouchStart={() => {
              setHoveredId(null); // hide tooltip immediately on touch start
            }}
            className={`hover:scale-105 transition cursor-pointer ${item.className}`}
          >
            <img src={item.imgPath} alt={item.id} className={`${iconSize}`} /> <span className="sr-only">{item.id}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

export default FloatContact;
