import React, { lazy, useState } from "react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { AiFillClockCircle } from "react-icons/ai";
import ScrollToTopButton from "../../../../resources/components/common/scrolltotopbutton";
const Team = lazy(() => import("../../../../resources/layouts/portfolio/team"));
const PortfolioContact = lazy(
  () => import("../../../../resources/UIBlocks/contact/PortfolioContact")
);
const HeaderPortfolio = lazy(
  () => import("../../../../resources/UIBlocks/header/header-portfolio")
);
const CardShowcase = lazy(
  () => import("../../../../resources/UIBlocks/CardShowcase")
);
import TestimonialCarousel from "../../../../resources/UIBlocks/testimonials/TestimonialCard";
import Consultant from "../../../../resources/UIBlocks/consultant/consultant";
import { FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import PortfolioFooter3 from "../../../../resources/UIBlocks/footer/PortfolioFooter3";
import HeroCarousel, {
  Slide,
} from "../../../../resources/UIBlocks/carousel/HeroCarousel";
import HighlightCardWithIcon from "../../../../resources/UIBlocks/card/HighlightedCardwithIcon";
const BrandMarquee = lazy(
  () => import("../../../../resources/components/marquee/BrandMarquee")
);
import { FaEye, FaBullseye, FaHandshake } from "react-icons/fa";
import BlogCarouselCard from "../../../../resources/UIBlocks/carousel/BlogCarouselCard";
import { LogicxBlogs } from "../../../../resources/global/library/blog";
import HighlightedBanner from "../../../../resources/UIBlocks/banner/HighlightedBanner";
import VerticalHoverBlocks from "../../../../resources/UIBlocks/banner/VerticalHoverBlocks";
import TypingText from "../../../../resources/AnimationComponents/TypingText";
import ProcessHighlightSection from "../../../../resources/UIBlocks/process/ProcessHighlightSection";
import SimpleBanner from "../../../../resources/UIBlocks/banner/SimpleBanner";
import Accordion from "../../../../resources/components/accordion/Accordion";
import NexusCard from "../../../../resources/UIBlocks/card/NexusCard";
import ProjectCarousel from "../../../../resources/UIBlocks/carousel/ProjectCarousel";

const Home: React.FC = () => {
  // Company About Card

  const contactItems = [
    {
      icon: FaPhoneAlt,
      value: "+91 98765 43210",
      href: "https://wa.me/919543439311",
    },
    { icon: AiFillClockCircle, value: "Mon-Sat: 9.00-18.00" },
    {
      icon: FaEnvelope,
      value: "info@logicx.com",
      href: "mailto:info@example.com",
    },
  ];

  const slidesData: Slide[] = [
    {
      id: 1,
      title1: "Smarter Operations.",
      title2: "Simplified ERP.",
      description:
        "Tailored ERP solutions to streamline your business—from inventory to invoicing, everything in one place.",
      image: "/assets/svg/home-hero.svg",
      bgClass: "bg-website-background text-website-foreground",
    },
    {
      id: 2,
      title1: "Powerful Integration.",
      title2: "Limitless Growth.",
      description:
        "Connect your ERP with Tally, WooCommerce, payment gateways, and more—for seamless business automation.",
      image: "/assets/svg/create.svg",
      bgClass: "bg-website-background text-website-foreground",
    },
    {
      id: 3,
      title1: "Custom Workflows.",
      title2: "Exact Fit ERP.",
      description:
        "We don’t just deploy—our domain experts craft workflows for retail, textile, manufacturing & service sectors.",
      image: "/assets/svg/home-hero.svg",
      bgClass: "bg-website-background text-website-foreground",
    },
    {
      id: 4,
      title1: "Actionable Insights.",
      title2: "Better Decisions.",
      description:
        "Leverage analytics and reporting tools to make data-driven decisions and boost efficiency.",
      image: "/assets/svg/slider.svg",
      bgClass: "bg-website-background text-website-foreground",
    },
    {
      id: 5,
      title1: "Reliable Support.",
      title2: "Real Results.",
      description:
        "From cloud hosting to training and migration, we stay with you at every step of your ERP journey.",
      image: "/assets/svg/slider.svg",
      bgClass: "bg-website-background text-website-foreground",
    },
  ];

  const [card] = useState<{ icon: string; label: string }[]>([
    { icon: "/assets/svg/ideas.svg", label: "ERP Strategy" },
    { icon: "/assets/svg/research.svg", label: "Industry Expertise" },
    { icon: "/assets/svg/seo.svg", label: "E-Commerce" },
    { icon: "/assets/svg/design.svg", label: "Custom Design" },
    { icon: "/assets/svg/support.svg", label: "Training & Support" },
  ]);

  const [OurStory] = useState([
    {
      image: "/assets/story/1.webp",
      title: "Our Humble Beginnings",
      description:
        "We started as a small team with big dreams, committed to creating innovative digital solutions that solve real business challenges.",
      buttonLabel: "Learn More",
    },
    {
      image: "/assets/story/2.webp",
      title: "First Milestone",
      description:
        "Our first major project helped us earn trust from clients worldwide, setting the foundation for long-term success.",
      buttonLabel: "Discover",
    },
    {
      image: "/assets/story/3.webp",
      title: "Growing Stronger",
      description:
        "With dedication and teamwork, we expanded our services, embraced new technologies, and grew our global presence.",
      buttonLabel: "Explore",
    },
    {
      image: "/assets/story/4.webp",
      title: "Global Recognition",
      description:
        "Awards and client testimonials recognized our passion for excellence, reinforcing our reputation as a trusted partner.",
      buttonLabel: "View More",
    },
    {
      image: "/assets/story/5.webp",
      title: "Looking Ahead",
      description:
        "Our journey continues with a mission to innovate, inspire, and deliver value to every client we serve.",
      buttonLabel: "Join Us",
    },
  ]);

  const industries = [
    {
      title: "Software Industry Solutions",
      image: "/assets/service/erpnext.png",
      description:
        "We deliver tailored ERP, billing, and e-commerce solutions designed to streamline operations and accelerate growth for software companies.",
      services: [
        {
          heading: "ERP for IT Services",
          description:
            "Manage projects, timesheets, client billing, and HR seamlessly with ERP integration.",
        },
        {
          heading: "License & Subscription Management",
          description:
            "Automate software license distribution, renewals, and subscription billing.",
        },
        {
          heading: "Client & Support Portal",
          description:
            "Provide a customer portal for ticketing, updates, and self-service support.",
        },
        {
          heading: "Analytics & Reporting",
          description:
            "Get real-time insights into project profitability, resource utilization, and client satisfaction.",
        },
      ],
    },
    {
      title: "Electronics Retail & Distribution",
      image: "/assets/industry/electronics.png",
      description:
        "Our ERP and e-commerce platforms empower electronics wholesalers, retailers, and distributors to manage high-volume inventory and multi-channel sales.",
      services: [
        {
          heading: "Inventory & Warehouse Management",
          description:
            "Handle thousands of SKUs with batch, serial number, and warranty tracking.",
        },
        {
          heading: "Multi-Channel E-Commerce",
          description:
            "Sell electronics online and offline with unified stock, order, and billing management.",
        },
        {
          heading: "Vendor & Customer Management",
          description:
            "Easily manage suppliers, purchase orders, and bulk customer accounts.",
        },
        {
          heading: "GST-Compliant Billing",
          description:
            "Generate invoices with GST compliance, discounts, and flexible tax rules.",
        },
        {
          heading: "After-Sales Service",
          description:
            "Track warranties, repairs, and replacements with automated service workflows.",
        },
      ],
    },
  ];

  // Company Info Card
  const companyInfo = [
    {
      icon: "/assets/svg/client.svg",
      count: 310,
      symbol: "k",
      field: "Client Request",
    },
    {
      icon: "/assets/svg/member.svg",
      count: 150,
      symbol: "",
      field: "Experts",
    },
    {
      icon: "/assets/svg/experience.svg",
      count: 15,
      symbol: "",
      field: "Experience",
    },
    { icon: "/assets/svg/award.svg", count: 120, symbol: "", field: "Award" },
  ];

  const cta = {
    title: "Start your ERP journey with a free consultation today.",
    buttonText: "Enquiry Now",
    buttonLink: "#contact",
  };

  const projects = [
    {
      title: "ERP Services We Offer",
      image: "/assets/service/erpnext.png",
      services: [
        {
          heading: "Implementation & Deployment",
          description:
            "We handle the complete setup of ERP—on cloud or on-premise—with user access control, email alerts, backup, and SSL configuration.",
        },
        {
          heading: "Module Customization",
          description:
            "Customize modules like Sales, Inventory, Accounting, HR, and Manufacturing to suit your unique workflow.",
        },
        {
          heading: "Tally Integration",
          description:
            "Bridge ERP with Tally for GST filing, financial reports, and accounting sync.",
        },
        {
          heading: "WooCommerce & eCommerce Integration",
          description:
            "Automate sales, stock, and invoices between your online store and ERP.",
        },
        {
          heading: "Training & Support",
          description:
            "Get in-depth training for staff, and ongoing technical support via call, email, or remote tools.",
        },
      ],
    },
    {
      title: "Ecart – E-Commerce Platform",
      image: "/assets/service/ecart.png",
      services: [
        {
          heading: "Custom Storefront",
          description:
            "Build and manage a fully customizable online store tailored to your brand identity.",
        },
        {
          heading: "Single Vendor Store",
          description:
            "Set up your own branded e-commerce store where you manage all products, orders, and customers directly.",
        },
        {
          heading: "Multi-Vendor Marketplace",
          description:
            "Launch a scalable marketplace where multiple sellers can register, list products, manage their own inventory, and receive payments through a controlled admin system.",
        },
        {
          heading: "Category & Product Management",
          description:
            "Easily manage and organize large catalogs with support for 2000+ products across multiple categories without performance issues.",
        },
        {
          heading: "Secure Payments",
          description:
            "Integrated payment gateways with safe checkout and multi-currency support.",
        },
        {
          heading: "Order Tracking",
          description:
            "Track orders and deliveries in real-time with automated status updates.",
        },
        {
          heading: "Mobile Friendly",
          description:
            "Responsive design for a smooth shopping experience across all devices.",
        },
      ],
    },
    {
      title: "QBill (Quick Bill)",
      image: "/assets/service/qbilling.png",
      services: [
        {
          heading: "GST-Compliant Invoicing",
          description: "Generate professional invoices with tax compliance.",
        },
        {
          heading: "POS Integration",
          description: "Fast and simple point-of-sale billing system.",
        },
        {
          heading: "Customer & Vendor Management",
          description: "Maintain customer/vendor data with ease.",
        },
        {
          heading: "Reports & Analytics",
          description: "Get detailed sales, expenses, and stock reports.",
        },
      ],
    },
  ];

  const product = [
    {
      id: 1,
      title: "Linkagro Exports Portfolio",
      description: "A modern personal portfolio site.",
      category: "website",
      image: "/assets/product/linkagro.jpg",
      link: "https://linkagro.in/",
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

  const teamData = [
    {
      image: "/assets/sample1.jpg",
      name: "Desirae Dias",
      designation: "CEO",
      bio: "Visionary leader driving innovation and excellence.",
    },
    {
      image: "/assets/sample1.jpg",
      name: "Madelyn Torff",
      designation: "Marketing Head",
      bio: "Expert in growth strategies and brand management.",
    },
    {
      image: "/assets/sample1.jpg",
      name: "Tiana Gouse",
      designation: "Project Manager",
      bio: "Ensures projects are delivered with precision and care.",
    },
    {
      image: "/assets/sample1.jpg",
      name: "Livia Passaquin",
      designation: "Director",
      bio: "Guides business strategy and organizational success.",
    },
  ];

  const brands = [
    { name: "DELL", logo: "/assets/client/dell.svg" },
    { name: "ACER", logo: "/assets/client/acer.svg" },
    { name: "HP", logo: "/assets/client/hp.svg" },
    { name: "LENOVO", logo: "/assets/client/lenovo.svg" },
    { name: "BENQ", logo: "/assets/client/benq.svg" },
    { name: "SAMSUNG", logo: "/assets/client/samsung.svg" },
    { name: "APPLE", logo: "/assets/client/apple.svg" },
  ];

  const Testimonials = [
    {
      id: 1,
      company: "TechCorp",
      logo: "/assets/client/client.png",
      feedback: "The software streamlined our operations...",
      client: "John Doe, CTO",
    },
    {
      id: 2,
      company: "HealthPlus",
      logo: "/assets/client/client.png",
      feedback: "We reduced costs by 25% after implementing... ",
      client: "Sarah Lee, Operations Head",
    },
    {
      id: 3,
      company: "HealthPlus",
      logo: "/assets/client/client.png",
      feedback: "We reduced costs by 25% after implementing... ",
      client: "Sarah Lee, Operations Head",
    },
  ];

  const contacts = [
    {
      icon: FaPhoneAlt,
      value: "+919894244450",
      href: "https://wa.me/919894244450",
    },
    { icon: AiFillClockCircle, value: "Mon-Sat: 9.00-18.00" },
    {
      icon: FaEnvelope,
      value: "info@logicx.com",
      href: "mailto:info@example.com",
    },
  ];

  const socialLinks = [
    { href: "https://facebook.com", icon: <FaFacebookF /> },
    { href: "https://twitter.com", icon: <FaTwitter /> },
    { href: "https://instagram.com", icon: <FaInstagram /> },
  ];

  const pages = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ];

  const newsletterText = "Subscribe to get the latest updates.";

  const VisionMission = [
    {
      title: "Our Vision",
      text: "To be a global leader in software innovation, creating solutions that empower businesses and enrich lives.",
      icon: <FaEye />,
    },
    {
      title: "Our Mission",
      text: "Deliver cutting-edge, scalable software solutions that drive efficiency, growth, and digital transformation for our clients.",
      icon: <FaBullseye />,
    },
    {
      title: "Our Values",
      text: "Integrity, innovation, collaboration, and excellence guide every project we undertake and every relationship we build.",
      icon: <FaHandshake />,
    },
  ];
  const blogs = [...LogicxBlogs];

  const [whyChoose] = useState([
    {
      number: 1,
      title: "Proven Development Process",
      description:
        "20+ Years of Proven Experience in Software Development and IT Solutions",
    },
    {
      number: 2,
      title: "Global Reach & Scalability",
      description:
        "Scalable & Custom Software Solutions for Startups to Enterprises",
    },
    {
      number: 3,
      title: "Technology Expertise",
      description:
        "Expertise Across Multiple Technologies – Web, Mobile, Cloud, and AI",
    },
    {
      number: 4,
      title: "Commitment to Quality",
      description:
        "Long-Term Client Partnerships based on Trust, Innovation, and Reliable Support",
    },
  ]);

  return (
    <main>
      <HeaderPortfolio
        menu={[
          { label: "Home", path: "home" },
          { label: "About Us", path: "about" },
          { label: "Services", path: "services" },
          { label: "Contact", path: "contact" },
        ]}
        contact={contactItems}
        contactHeader={true}
      />
      <section id="home" className="">
        {/* Top view */}
        <HeroCarousel
          slides={slidesData}
          autoSlide={true}
          autoSlideInterval={7000}
        />
        {/* Company About Card */}
        <div className="grid grid-cols-1 mb-10 lg:grid-cols-5">
          {card.map((item, index) => (
            <div
              key={index}
              className="flex flex-col p-5 lg:p-8 bg-[#17965f] gap-5 border-r-1 items-center justify-center  border-b lg:border-0 border-gray-100 last:border-b-0"
            >
              <div className="w-16 xl:w-16">
                <img src={item.icon} alt="" loading="lazy" />
              </div>
              <div className="text-lg uppercase mt-2 font-semibold text-gray-50">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Part */}
      <section id="about" className="flex flex-col gap-15 pb-20">
        <div className="px-5 lg:px-[12%] grid lg:grid-cols-2 gap-15 pt-10 pb-10">
          <div className="flex justify-center items-center">
            <img
              src={"/assets/about.jpg"}
              className="w-full object-cover"
              alt="img"
              loading="lazy"
            />
          </div>

          <div className="flex flex-col  justify-center gap-8">
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold">
              Leading ERP Solution Provider in India
            </h1>
            <p>
              At LogicX, we specialize in ERP implementation, customization, and
              ongoing support for small to medium businesses across India.
              Whether you run a manufacturing unit, textile business, retail
              shop, or service-based company, our tailored ERP solutions help
              streamline operations, reduce manual errors, and improve
              decision-making.
            </p>
            <p>
              Our certified developers and domain experts ensure seamless
              integration with tools like Tally, Woo Commerce, and payment
              gateways. We offer cloud hosting, server setup, data migration,
              and training for your team—so you can focus on growth, not on
              systems.
            </p>
          </div>
        </div>

        {/* vision mission section */}
        <HighlightCardWithIcon
          className="grid-cols-1 md:grid-cols-3"
          sectionTitle=""
          items={VisionMission}
        />

        <div className="px-4 py-10 lg:px-[10%]">
          <div className="flex flex-col gap-3 pt-5">
            <h1 className="text-2xl text-center md:text-3xl lg:text-4xl font-bold p-5">
              Our ERP Success Stories
            </h1>
            <p className="text-center p-5 mb-5 lg:px-[12%]">
              From textile manufacturers to retail chains and IT service
              providers, LogicX has delivered tailored ERP solutions that
              transform operations. With 20+ years of experience, we help Indian
              SMEs automate workflows, improve visibility, and scale with
              confidence.
            </p>
          </div>
          <HighlightedBanner sections={OurStory} />
        </div>

        {/* Our ERP Success Stories */}
      </section>

      <div className="py-20 ">
        <Consultant
          companyInfo={companyInfo}
          backgroundImage="/assets/software.avif"
          cta={cta}
        />
      </div>

      <section id="services" className="min-h-[100vh] flex flex-col gap-20">
        <div className="px-5 lg:px-[10%] ">
          <CardShowcase items={projects} />
        </div>

        <ProcessHighlightSection
          title="Why choose us?"
          description=""
          imageUrl="/assets/about1.jpg"
          bgimage="/assets/bg1.jpg"
          steps={whyChoose}
        />
        <div className="py-10 px-5 lg:px-[10%] ">
          <VerticalHoverBlocks
            sections={[
              {
                label: "CX INSIGHTS",
                date: "APR 17, 2024",
                title:
                  "AI-Driven Agent Training: A Paradigm Shift for Contact Centers",
                description:
                  "In this LinkedIn Live event, Forrester and [24]7.ai discussed how generative AI is transforming contact centers with quick, cost-effective, and efficient agent onboarding.",
                image: "/assets/1.jpg",
                ctaText: "Read More",
              },
              {
                label: "EVENTS",
                title: "Upcoming Webinars",
                description: "Join our thought leaders for live discussions.",
                image: "/assets/2.jpg",
              },
              {
                label: "NEWS",
                title: "Product Release Q3",
                description: "Discover the latest features and updates.",
                image: "/assets/3.jpg",
              },
            ]}
          />
        </div>

        <div className="px-5 lg:px-[10%] ">
          <TypingText
            fixedMessage="Choose From"
            messages={[
              "Predesigned Templates",
              "Software Modules",
              "Ready-Made Layouts",
            ]}
            typingSpeed={100}
            pauseTime={1500}
            className="text-4xl md:text-5xl font-bold text-gray-900"
          />

          {/* Description */}
          <p className=" text-gray-700 text-base md:text-lg leading-relaxed my-10 text-center">
            Use our pre-designed templates to kickstart your project. Customize
            colors, layouts, and styles to create a professional and inviting
            interface for your users. All templates are fully responsive and
            ready to integrate into your software or website.
          </p>

          <ProjectCarousel
            products={product}
            autoSlide={true}
            autoSlideInterval={4000}
          />
        </div>
        <NexusCard
          sectionTitle="Integrations"
          sectionDescription="Streamline your marketing activities by integrating collected data with the choice of your CRM and campaign integration options."
          leftClassName="text-left"
          rightClassName="grid-rows-3"
          items={[
            {
              logo: "/assets/hp.svg",
              alt: "Stripe",
              title: "Stripe",
              className: "bg-[#3E2F89]",
            },
            {
              logo: "/assets/hp.svg",
              alt: "PayPal",
              title: "PayPal",
              className: "bg-[#c71313]",
            },
            {
              logo: "/assets/hp.svg",
              alt: "Razorpay",
              title: "Razorpay",
              className: "bg-[#67c090] row-span-2",
            },
            {
              logo: "/assets/hp.svg",
              alt: "QuickBooks",
              title: "QuickBooks",
              className: "bg-[#ea2264]",
            },
            {
              logo: "/assets/hp.svg",
              alt: "Xero",
              title: "Xero",
              className: "bg-[#f5babb] row-span-2",
            },
            {
              logo: "/assets/hp.svg",
              alt: "Tally",
              title: "Tally",
              className: "bg-[#b2b0e8]",
            },
          ]}
        />

        <div className="px-5 lg:px-[10%] ">
          <Team
            title="Meet Our Professionals"
            description="Our team combines creativity, expertise, and dedication to deliver outstanding solutions for our clients."
            members={teamData}
          />
        </div>
      </section>

      <div className="my-25 py-15 md:py-20 bg-website-background">
        <BrandMarquee
          text="Our Clients"
          type="logo"
          brands={brands}
          speed={30}
          height={12}
        />
      </div>

      <div className="mt-20">
        <h1 className="text-2xl md:text-4xl text-center font-bold">
          What Our Client Says
        </h1>
        <TestimonialCarousel testimonials={Testimonials} />
      </div>

      <div className="md:px-[10%] p-4 my-15">
        <BlogCarouselCard blogs={blogs} title={"Latest Posts & Articles"} />
      </div>

      <section
        id="contact"
        className="min-h-[100vh] flex flex-col px-4 lg:px-[10%]"
      >
        <PortfolioContact
          mapSrc={
            "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d557.9677738430108!2d77.33628450184978!3d11.1131330605361!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba907abde6b9b0b%3A0x15ed72f683d49e9b!2sTech%20Media%20Retail!5e1!3m2!1sen!2sin!4v1755945911404!5m2!1sen!2sin"
          }
        />
      </section>

      <div className="px-5 py-20 lg:px-[10%]">
        <SimpleBanner
          title={"Turning Complexity into Simplicity"}
          imgPath={"assets/h1.png"}
          path={"contact"}
          buttonLabel={"Start Now"}
          className="bg-purple-800"
          buttonStyle="bg-foreground text-background "
          textStyle="text-background"
        />
      </div>

      <div className="px-[10%] pb-15">
        <Accordion
          title="Frequently Asked Questions"
          type="plus"
          items={[
            {
              question: "1. What is billing software?",
              answer:
                "Billing software helps businesses generate invoices, manage payments, and track customer transactions digitally.",
            },
            {
              question: "2. Can I generate GST-compliant invoices?",
              answer:
                "Yes, the software supports GST-compliant invoicing with automatic tax calculations.",
            },
            {
              question: "3. Does it support multiple payment methods?",
              answer:
                "Yes, it supports cash, card, UPI, net banking, and wallet payments.",
            },
            {
              question: "4. Can I track customer payment history?",
              answer:
                "Absolutely. You can view, filter, and download detailed payment and invoice history.",
            },
            {
              question: "5. Is the software cloud-based?",
              answer:
                "Yes, it is cloud-based, so you can access your billing data securely from anywhere.",
            },
            {
              question: "6. Does it support recurring invoices?",
              answer:
                "Yes, you can automate recurring billing for subscription-based services.",
            },
            {
              question: "7. Can I manage inventory with it?",
              answer:
                "Yes, it comes with inventory management features to track stock levels and alerts.",
            },
            {
              question: "8. Is it secure for handling customer data?",
              answer:
                "Yes, all data is encrypted and stored securely with regular backups.",
            },
            {
              question: "9. Can I generate financial reports?",
              answer:
                "Yes, the software provides sales, tax, profit, and expense reports for better decision-making.",
            },
            {
              question: "10. Is it suitable for small businesses?",
              answer:
                "Yes, it is designed for startups, SMEs, and enterprises with scalable features.",
            },
          ]}
          titleStyle={"text-2xl py-10"}
        />
      </div>

      <PortfolioFooter3
        address="436, Avinashi Road, Near CITU Office, Tiruppur, Tamil Nadu 641602"
        contacts={contacts}
        socialLinks={socialLinks}
        pages={pages}
        newsletterText={newsletterText}
        newsletterPlaceholder="Your email"
        newsletterButtonText="Subscribe"
        companyName="Logicx"
      />
      <ScrollToTopButton />
    </main>
  );
};

export default Home;
