import { Routes, Route } from "react-router-dom";
import ScrollToTop from "../../../resources/components/common/scrolltotop";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import { lazy, Suspense } from "react";
import LoadingScreen from "../../../resources/components/loading/LoadingScreen";
import TransparentHeader from "../../../resources/UIBlocks/header/TransparentHeader";
import PortfolioFooter from "../../../resources/UIBlocks/footer/PortfolioFooter2";
const Home = lazy(() => import("./pages/Home"));

function AppRoutes() {
  return (
    <div className="overflow-y-hidden">
      <ScrollToTop />
      <Suspense
        fallback={<LoadingScreen image={"/assets/svg/aaran_logo.svg"} />}
      >
        <TransparentHeader
          menu={[
            { label: "Home", path: "home" },
            { label: "About Us", path: "about" },
            { label: "Product", path: "product" },
            { label: "Contact", path: "contact" },
          ]}
        />

        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>

        <PortfolioFooter
          logo="assets/svg/aaran_logo.svg"
          newsletterTitle="Subscribe Our Newsletter"
          newsletterPlaceholder="Email Address"
          newsletterButton="Submit Now"
          companyLinks={[
            { label: "Features", url: "#" },
            { label: "Pricing", url: "#" },
            { label: "Testimonials", url: "#" },
            { label: "FAQ’s", url: "#" },
          ]}
          utilityLinks={[
            { label: "Style Guide", url: "#" },
            { label: "Licenses", url: "#" },
            { label: "Changelog", url: "#" },
          ]}
          socialLinks={[
            { icon: <FaFacebookF />, label: "Facebook", url: "#" },
            { icon: <FaInstagram />, label: "Instagram", url: "#" },
            { icon: <FaTwitter />, label: "Twitter", url: "#" },
            { icon: <FaLinkedinIn />, label: "LinkedIn", url: "#" },
          ]}
          copyright="Copyright © 2025 Aaran."
        />
      </Suspense>
    </div>
  );
}

export default AppRoutes;
