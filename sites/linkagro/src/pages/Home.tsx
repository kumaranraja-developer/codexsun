import DynamicCard from "../../../../resources/components/card/DynamicCard";
import Card2 from "../../../../resources/components/card/Card2";
import HeroCarousel, {
  Slide,
} from "../../../../resources/UIBlocks/carousel/HeroCarousel";
import BlogCarouselCard from "../../../../resources/UIBlocks/carousel/BlogCarouselCard";
import { useState } from "react";
import ProcessHighlightSection from "../../../../resources/UIBlocks/process/ProcessHighlightSection";
import PortfolioContact from "../../../../resources/UIBlocks/contact/PortfolioContact";
import { LinkAgroBlogs } from "./Blog";

function Home() {
  const slidesData: Slide[] = [
    {
      id: 1,
      title1: "Sustainable Coco Peat.",
      title2: "Trusted Worldwide.",
      description:
        "Link Agro Exports manufactures and exports premium coco peat products, trusted by growers and horticulturists across the globe.",
      image: "/assets/product/Cocopeat5kgBlock.webp",
      bgClass: "",
      backdrop: "assets/backdrop/bg6.webp",
      backdropposition: "-top-65 md:-top-55 md:-right-20 lg:-top-20 lg:-right-120",
    },
    {
      id: 2,
      title1: "Made in India, Tamil Nadu.",
      title2: "Quality from Source.",
      description:
        "Our plant in Uchipuli, Tamil Nadu, is surrounded by abundant coconut farms and excellent groundwater, ensuring high-quality raw material.",
      image: "/assets/product/bb6501.webp",
      bgClass: "",
      backdrop: "assets/backdrop/bg5.webp",
      backdropposition: "-top-75 -left-5 md:-left-70 md:-top-40 lg:-left-170 lg:top-0",
    },
    {
      id: 3,
      title1: "Eco-Friendly Process.",
      title2: "Natural & Reliable.",
      description:
        "We produce coir and coco peat products using sustainable methods that preserve natural resources and support green farming.",
      image: "/assets/product/Coco husk chips block 1.webp",
      bgClass: "",
      backdrop: "assets/backdrop/bg9.webp",
      backdropposition: "-top-80 right-0 md:-top-80 lg:-top-20",
    },
    {
      id: 4,
      title1: "Perfect for Cultivation.",
      title2: "Proven Growth Medium.",
      description:
        "Our coco peat ensures optimal water retention, aeration, and root development—ideal for nurseries, greenhouses, and hydroponics.",
      image: "/assets/product/discs.webp",
      bgClass: "",
      backdrop: "assets/backdrop/bg5.webp",
      backdropposition: "-top-70 -left-30 md:-top-60 md:-left-80 lg:-left-150 lg:-top-30",
    },
  ];

  const product = [
    {
      image: "/assets/product/bb6501.webp",
      title: "COCO PEAT BRIQUETTE (650Grams)",
      animate: "animate__animated animate__fadeInRight",
    },
    {
      image: "/assets/product/coco-coins.webp",
      title: "COCOPEAT GROW BAGS & DISCS",
      animate: "animate__animated animate__fadeInRight",
    },
    {
      image: "/assets/product/CoirFiber.webp",
      title: "COCO COIR FIBER",
      animate: "animate__animated animate__fadeInRight",
    },
    {
      image: "/assets/product/Cocopeat5kgBlock.webp",
      title: "Coco Peat 5KG Blocks",
      animate: "animate__animated animate__fadeInRight",
    },
    {
      image: "/assets/product/Coco husk chips block 1.webp",
      title: "COCO HUSK CHIPS",
      animate: "animate__animated animate__fadeInRight",
    },
    {
      image: "/assets/product/Cocodiscsseedling.webp",
      title: "Coco disc seedling",
      animate: "animate__animated animate__fadeInRight",
    },
  ];

  const company = [
    {
      title: "Trusted Manufacturer & Exporter of Coco Peat Products",
      body: `Pioneers in the industry
since 2014, exporting
globally to South Korea,
Japan, Vietnam & more.`,
      animate: "animate__animated animate__fadeInLeft animate__fast",
    },
    {
      title: `Premium-Grade
Products for Horticulture
& Agriculture`,
      body: `Delivering Coir Peat
Blocks, Bricks, Grow Bags,
Discs & Fibers tailored for
nurseries, greenhouses, and
landscaping.`,
      animate: "animate__animated animate__fadeInUp animate__fast",
    },
    {
      title: `State-of-the-Art
Manufacturing Facility in
Tamil Nadu`,
      body: `From coconut husk sourcing
to final compression, we
maintain strict quality
standards with customizable
packing options.`,
      animate: "animate__animated animate__fadeInRight animate__fast",
    },
  ];

  const blogs = [...LinkAgroBlogs];

  const [processSteps] = useState([
    {
      number: 1,
      title: "Our process",
      description:
        "We manufacture and customize coir substrates as per customer requirements with our experienced team and we guide you on the best possible growing solutions.",
    },
    {
      number: 2,
      title: "Region",
      description:
        "We are located in a place with tropical climates where we grow lush green coconut trees. Our raw materials are sourced from local farmers situated here that ensure their livelihood. And abundance of ground water source available here enables us manufacture good quality Low-EC cocopeat.",
    },
    {
      number: 3,
      title: "Logistics & Export",
      description:
        "We have our own exports and logistics team with experienced professionals. Our team directly coordinates with buyers and export agency to ensure uninterrupted transport and shipping of cocopeat across the globe.",
    },
    {
      number: 4,
      title: "Quality",
      description:
        "We have a separate team of people who involve in ensuring quality in each and every step of cocopeat manufacturing process. Right from sourcing coconut husk to producing various cocopeat final products our team follows the quality parameters to deliver top-notch products.",
    },
  ]);


  return (
    <div className="">
      <div className="">
        <HeroCarousel
          slides={slidesData}
          autoSlide={true}
          autoSlideInterval={7000}
        />
      </div>

      <div className="bg-primary py-20 flex flex-col gap-10">
        <h1 className="text-center font-bold text-primary-foreground text-4xl animate__animated animate__fadeInDown animate__fast">
          Link Agro Exports
        </h1>
        <div className="container mx-auto px-5 md:px-[10%]">
          <Card2
            items={company}
            containerStyle={"grid-cols-1 sm:grid-cols-3"}
            lineStyle="w-3 h-12"
          />
        </div>
      </div>

      <div className="relative bg-cover py-10 bg-center">
        {/* Section Content */}
        <div className="px-5 lg:px-[10%] py-20 relative z-10">
          <h1 className="text-center font-bold text-4xl my-5">Our Products</h1>
          <DynamicCard
            Card={product}
            containerStyle="grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
          />
        </div>
      </div>

      <ProcessHighlightSection
        title="Why choose us?"
        description="Link Agro Cocopeat - 100% Eco-friendly and Organic soilless growing substrate"
        imageUrl="/assets/img2.webp"
        bgimage="/assets/cocobg.webp"
        steps={processSteps}
      />

      {/* <div className="my-25">
        <h1 className="text-2xl md:text-4xl text-center font-bold">
          What Our Client Says
        </h1>
        <TestimonialCarousel testimonials={Testimonials} autoSlide={true} />
      </div> */}

      <div className="md:px-[10%] p-4 my-15">
        <BlogCarouselCard blogs={blogs} title={"Latest Posts & Articles"} />
      </div>

      <div className="mb-25 px-4 md:px-[10%]">
        <PortfolioContact mapSrc={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3298.8954649636466!2d79.01264938194326!3d9.311330379605293!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0194ceb3bc85e9%3A0x5260d3415a34fe6b!2sUchipuli%2C%20Tamil%20Nadu!5e1!3m2!1sen!2sin!4v1755938160114!5m2!1sen!2sin`} />
      </div>
    </div>
  );
}

export default Home;
