import { lazy } from "react";
import HeroBanner from "../../../../resources/UIBlocks/banner/HeroBanner";
import StartingSection1 from "../../../../resources/UIBlocks/startingsection/StartingSection1";
import TestimonialCarousel from "../../../../resources/UIBlocks/testimonials/TestimonialCard";
import ContactCard from "../../../../resources/UIBlocks/card/ContactCard";

const TransparentCard = lazy(
  () => import("../../../../resources/UIBlocks/card/TransparentCard")
);
const AnimatedCard = lazy(
  () => import("../../../../resources/UIBlocks/card/animatedCard")
);
const Pricing = lazy(
  () => import("../../../../resources/UIBlocks/pricingcard/Pricing")
);
const PortfolioContact = lazy(
  () => import("../../../../resources/UIBlocks/contact/PortfolioContact")
);
const FlexColCard = lazy(
  () => import("../../../../resources/UIBlocks/card/FlexColCard")
);
const ProductShowcase = lazy(
  () =>
    import("../../../../resources/UIBlocks/portfolioProducts/ProductShowcase")
);

const BrandMarquee = lazy(
  () => import("../../../../resources/components/marquee/BrandMarquee")
);
function Home() {
  const brands = [
    { name: "DELL" },
    { name: "HP" },
    { name: "BENQ" },
    { name: "SAMSUNG" },
    { name: "APPLE" },
  ];

  const cardData = [
    {
      title: "ERPNext Customization",
      description:
        "Tailored ERPNext solutions to streamline your business operations with automation, reporting, and scalability.",
      image: "assets/svg/animatesvg/dashboard.svg",
      hoverColor: "from-primary via-primary/0 to-primary/0",
    },
    {
      title: "QBill – Smart Billing",
      description:
        "Simplify invoicing, track payments, and manage accounts effortlessly with our secure billing software.",
      image: "assets/svg/animatesvg/qbilling.svg",
      hoverColor: "from-primary via-primary/0 to-primary/0",
    },
    {
      title: "eCart Solutions",
      description:
        "Custom e-commerce platforms with product management, payment integration, and advanced analytics.",
      image: "assets/svg/animatesvg/ecart.svg",
      hoverColor: "from-primary via-primary/0 to-primary/0",
    },
  ];
  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      description: "Basic features for individuals",
      features: [
        { id: 1, text: "Access to core features" },
        { id: 2, text: "1 Project" },
        { id: 3, text: "Community Support" },
        { id: 4, text: "Basic Analytics" },
        { id: 5, text: "Email Alerts" },
        { id: 6, text: "Single User" },
        { id: 7, text: "Basic Templates" },
        { id: 8, text: "Limited Storage" },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 15,
      description: "Advanced features for professionals",
      highlight: true, // highlight this plan
      features: [
        { id: 1, text: "Everything in Free" },
        { id: 2, text: "Unlimited Projects" },
        { id: 3, text: "Priority Support" },
        { id: 4, text: "Advanced Analytics" },
        { id: 5, text: "Team Collaboration" },
        { id: 6, text: "Export Data" },
        { id: 7, text: "Custom Branding" },
        { id: 8, text: "Cloud Backup" },
        { id: 9, text: "Role Management" },
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 30,
      description: "All features for large teams",
      features: [
        { id: 1, text: "Everything in Pro" },
        { id: 2, text: "Dedicated Manager" },
        { id: 3, text: "Custom Integrations" },
        { id: 4, text: "API Access" },
        { id: 5, text: "Advanced Security" },
        { id: 6, text: "24/7 Support" },
        { id: 7, text: "Custom Workflows" },
        { id: 8, text: "Unlimited Storage" },
      ],
    },
  ];

  const data = [
    {
      id: "sales",
      label: "Sales",
      title: "Define and automate your sales process",
      description:
        "Give your sales team the means to sell efficiently across channels with a structured and repeatable sales process.",
      navLink: "/sales",
      image: "assets/dashboard.png",
      subImages: [
        "assets/react.svg",
        "/assets/react.svg",
        "/assets/react.svg",
        "/assets/react.svg",
      ],
    },
    {
      id: "marketing",
      label: "Marketing",
      title: "Plan and execute marketing campaigns",
      description:
        "Automate campaign workflows, capture leads, and analyze performance for better ROI.",
      navLink: "/marketing",
      image: "assets/dashboard.png",
      subImages: ["assets/react.svg"],
    },
    {
      id: "service",
      label: "Service",
      title: "Deliver better customer support",
      description:
        "Track tickets, resolve issues faster, and improve customer satisfaction.",
      navLink: "/service",
      image: "assets/dashboard.png",
      subImages: ["/assets/react.svg"],
    },
  ];

  const product = [
    {
      id: 1,
      title: "Linkagro Exports Portfolio",
      description: "A modern personal portfolio site.",
      category: "website",
      image: "/assets/product/linkagro.png",
      link: "https://fabulous-queijadas-684a73.netlify.app/",
    },
    {
      id: 2,
      title: "Tech media eCart",
      description: "Mobile app for shopping.",
      category: "app",
      image: "/assets/product/techmedia.png",
      link: "https://techmedia.in",
    },
    {
      id: 3,
      title: "Logicx Portfolio",
      description: "Corporate business website.",
      category: "website",
      image: "/assets/product/logicx.png",
      link: "https://logicx.in/",
    },
    {
      id: 4,
      title: "Aaran Portfolio",
      description: "Corporate business website.",
      category: "website",
      image: "/assets/product/aaran.png",
      link: "https://grand-florentine-b254ee.netlify.app/",
    },
    {
      id: 5,
      title: "ERPNext",
      description: "Corporate business website.",
      category: "app",
      image: "/assets/product/linkagro.png",
      link: "https://example.com/company",
    },
  ];

  const Testimonials = [
    {
      id: 1,
      company: "TechCorp",
      logo: "/logos/techcorp.png",
      feedback: "The software streamlined our operations...",
      client: "John Doe, CTO",
    },
    {
      id: 2,
      company: "HealthPlus",
      logo: "/logos/healthplus.png",
      feedback: "We reduced costs by 25% after implementing...",
      client: "Sarah Lee, Operations Head",
    },
  ];
  return (
    <div>
      <div id="home">
        <StartingSection1 />
      </div>

      <div className="px-6 md:px-[10%] ">
        <FlexColCard items={data} heading="automate your sales" />
      </div>

      <div className="mt-24"></div>

      <AnimatedCard
        cards={cardData}
        title={"Our Products"}
        description={
          "Explore our wide range of products crafted with quality and precision. Designed to meet your needs and deliver the best experience."
        }
      />

      <div className="mt-20">
        <TransparentCard image="assets/dashboard.png" />
      </div>

      <div className="mt-20 px-4 md:px-[10%]">
        <Pricing plans={plans} />
      </div>

      <div className="my-10 md:my-20 py-10 md:py-10 ">
        <BrandMarquee type="big-text" brands={brands} speed={30} height={16} />
      </div>

      <div className="px-4 flex flex-col gap-10 md:px-[10%]" id="product">
        <ProductShowcase products={product} />
        <HeroBanner
          badgeText="⚡ Trusted Protection for Every Doorstep"
          title="Your safety is our mission. Your trust is our commitment"
          subtitle="Click below to schedule your free risk assessment and learn how we can help protect your world."
          buttonText="Start Protecting Your Presence"
          buttonLink="/contact"
        />
      </div>

      <div className="my-25">
        <h1 className="text-2xl md:text-4xl text-center font-bold">
          What Our Client Says
        </h1>
        <TestimonialCarousel testimonials={Testimonials} />
      </div>

      <div id="contact" className="px-4 md:px-[10%]">
        <PortfolioContact mapSrc={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3298.8954649636466!2d79.01264938194326!3d9.311330379605293!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0194ceb3bc85e9%3A0x5260d3415a34fe6b!2sUchipuli%2C%20Tamil%20Nadu!5e1!3m2!1sen!2sin!4v1755938160114!5m2!1sen!2sin`} />
        <ContactCard
          contact={{
            address: "Mahavishnu Nagar, Tiruppur, Tamil Nadu",
            phone: ["+91 98765 43210", "+91 91234 56789"], // multiple numbers
            email: ["hello@example.com", "support@example.com"], // multiple emails
          }}
        />
      </div>
    </div>
  );
}

export default Home;
