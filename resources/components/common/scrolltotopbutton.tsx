import { useEffect, useState } from "react";

function ScrollToTopButton() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > window.innerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed right-10 bottom-17 z-50 cursor-pointer bg-foreground rounded-full shadow-lg hover:scale-105 transition-transform duration-300 ${
        showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5 pointer-events-none"
      }`}
      onClick={scrollToTop}
    >
      <img src="/assets/svg/scroll.svg" className="w-12 h-12" alt="Scroll to top" />
    </div>
  );
}

export default ScrollToTopButton;
