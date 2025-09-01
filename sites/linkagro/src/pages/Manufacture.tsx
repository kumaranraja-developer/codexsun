import PortfolioProduct1 from "../../../../resources/UIBlocks/portfolioProducts/PortfolioProduct1";
import ImageCarousel from "../../../../resources/UIBlocks/carousel/ImageCarousel";
import { useInView } from "react-intersection-observer";

const steps = [
  {
    title: "Coconut Husk Sourcing",
    description:
      "We source good-sized coconut husks directly from local coconut farmers who cultivate trees nearby.",
    image: "/assets/manufacturing/1 Coconut Husk Sourcing.webp",
  },
  {
    title: "Coconut Husk Processing",
    description:
      "The husks are soaked and fed into fiber-making machines, initiating the separation of fiber from peat.",
    image: "/assets/manufacturing/2 Coconut Husk processing.webp",
  },
  {
    title: "Filtering Fibers from Peat",
    description:
      "Coarse fibers are filtered out during processing to isolate cocopeat particles.",
    image: "/assets/manufacturing/3 Filtering Fibers from Peat.webp",
  },
  {
    title: "Sieved CocoPeat Separation",
    description:
      "We sieve the remaining material to completely separate fine cocopeat from residual fibers.",
    image: "/assets/manufacturing/4 Seived CocoPeat Separation.webp",
  },
  {
    title: "Washing Cocopeat",
    description:
      "Cocopeat is washed using soft water to reduce electrical conductivity (EC) for low EC applications.",
    image: "/assets/manufacturing/5 Washing Cocopeat.webp",
  },
  {
    title: "Drying",
    description:
      "The washed cocopeat is sun-dried thoroughly to preserve its quality and moisture level.",
    image: "/assets/manufacturing/6 Drying.webp",
  },
  {
    title: "Cocopeat compressed into 5KG Blocks",
    description:
      "Once dried and filtered, the cocopeat is compressed into standard 5KG blocks for easy handling.",
    image: "/assets/manufacturing/7 Cocopeat compressed as 5KG Blocks.webp",
  },
  {
    title: "5KG Blocks Ready to Ship",
    description:
      "The final compressed blocks are packaged and made ready for export or direct client delivery.",
    image: "/assets/manufacturing/8 5Kg blocks ready to be shipped.webp",
  },
];

function Manufacture() {
  const [ref5, inView5] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="mt-20">
      <ImageCarousel
        images={[
          { id: "1", image: "/assets/manufacturing/slider1.webp" },
          { id: "2", image: "/assets/manufacturing/slider2.webp" },
          { id: "3", image: "/assets/manufacturing/slider3.webp" },
        ]}
        interval={6000}
      />

      {/* Our Commitment */}
      <div
        className={`bg-primary p-6 mt-20 rounded-lg shadow-md mx-[10%]  ${
          inView5 ? "animate__animated animate__fadeInUp" : "opacity-0"
        }`}
        ref={ref5}
      >
        <p className="text-base text-primary-foreground leading-relaxed">
          Link Agro Exports is a distinguished manufacturer and exporter of
          high-quality coco peat products. Our plant is located in Uchipuli,
          Tamilnadu which is known for its conducive climate for coconut
          cultivation. And this place has excellent ground water source. Hence
          this geographical feasibility enables us producing good quality coir
          and coco-peat products.
        </p>
      </div>

      <div className="px-5 lg:px-[10%] py-12">
        <h2 className="text-4xl font-bold text-center mb-12 animate__animated animate__fadeInDown animate__fast">
          Cocopeat Manufacturing Process
        </h2>
        {steps.map((item, index) => (
          <PortfolioProduct1
            key={index}
            item={item}
            reverse={index % 2 === 1}
          />
        ))}
      </div>
      
    </div>
  );
}

export default Manufacture;
