import { lazy } from "react";
import { useInView } from "react-intersection-observer";
import Card2 from "../../../../resources/components/card/Card2";
const Team = lazy(() => import("../../../../resources/layouts/portfolio/team"));
function About() {
  const [ref1, inView1] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [ref4, inView4] = useInView({ triggerOnce: true, threshold: 0.1 });

  const company = [
    {
      title: "Our Strength",
      body: `High Quality Products - Right time delivery - Best price in the market – Tailor made services - 100% Positive Feedback`,
      animate: "animate__animated animate__fadeInRight",
    },

    {
      title: `Our Process`,
      body: `Coconut Husk Feeding – Crushing – Separating Peat from Fiber – Peat Washing – Drying – Compressing as blocks`,
      animate: "animate__animated animate__fadeInRight",
    },
  ];

  const teamData = [
    {
      image: "/assets/team/ram.webp",
      name: "Mr.Ramchandran ",
      designation: "Head – Logistics & Exports",
      bio: "",
      email: "ram@linkagro.in",
    },
    {
      image: "/assets/team/siva.webp",
      name: "Mr.Thirumurugan",
      designation: "Head – Production & Sourcing",
      bio: "",
      email: "thiru@linkagro.in",
    },
  ];
  return (
    <div className="">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[50vh] mt-20 w-full">
        <img
          src="/assets/Homepage1.webp"
          alt="Sample"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/70" />
        <div className="absolute inset-0 flex items-center">
          <div className="md:w-2/3 px-5 lg:px-[10%] text-background space-y-4">
            <h1 className="text-2xl lg:text-4xl font-bold animate__animated animate__fadeIn animate__fast">
              Committed to Quality. Driven by Nature.
            </h1>
            <p className="text-sm lg:text-lg text-background/80 text-justify animate__animated animate__fadeIn animate__slow">
              From South India to the World. Founded in 2014, Link Agro Exports
              stands for quality, consistency, and customer satisfaction. We
              manufacture and export premium coco peat products designed to
              enrich agriculture and horticulture practices.
            </p>
          </div>
        </div>
      </div>

      {/* About Content Section */}
      <div className="text-foreground/80 pt-20 px-5 lg:px-[10%]">
        <div className="mx-auto">
          <p
            className={`text-lg leading-relaxed first-letter:text-2xl first-letter:font-bold text-justify ${
              inView1 ? "animate__animated animate__fadeInDown" : "opacity-0"
            }`}
            ref={ref1}
          >
            We incepted our coco-peat production factory in 2014. Initially, we
            supplied our products to leading exporting companies in Tamil Nadu.
            Later, we decided to cater our services directly to end-users who
            are emerging globally by exporting.
          </p>

          <div className="container px-5 lg:px-[10%] my-20">
            <Card2
              items={company}
              containerStyle={"grid-cols-1 sm:grid-cols-2"}
              lineStyle="w-3 h-12"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className={`text-lg leading-relaxed `}>
              <h3 className="text-2xl font-semibold text-primary mb-4">
                Over a Decade of Excellence
              </h3>
              <p className="text-base leading-relaxed text-justify">
                With more than a decade of experience, we specialize in
                supplying premium-grade products for horticulture, farming, and
                landscaping applications across global markets. As one of the
                pioneers in the coir pith industry, Link Agro Exports has
                established a strong international presence by exporting to
                countries like{" "}
                <span className="font-bold text-lg">
                  South Korea, Spain, Vietnam, and Japan
                </span>
                .
                <br />
                <br />
                Our commitment to quality, innovation, and customer satisfaction
                has positioned us as a trusted leader in the field.
              </p>
            </div>

            {/* Right Column - Product List */}
            <div className={`bg-white p-6 rounded-lg shadow-md `}>
              <h3 className="text-2xl font-semibold text-primary mb-4">
                What We Deliver
              </h3>
              <ul className="list-disc list-inside space-y-2 text-base">
                <li>Coir Peat Blocks</li>
                <li>Coir Peat Bricks</li>
                <li>Coco Mats</li>
                <li>Coco Discs</li>
                <li>Coir Fibers</li>
                <li>Grow Bags</li>
              </ul>
            </div>
          </div>

          {/* Our Commitment */}
          <div
            className={`bg-primary p-6 mt-20 rounded-lg shadow-md  ${
              inView4 ? "animate__animated animate__fadeInUp" : "opacity-0"
            }`}
            ref={ref4}
          >
            <h3 className="text-2xl font-semibold text-primary-foreground mb-4">
              Our Commitment
            </h3>
            <p className="text-base text-primary-foreground leading-relaxed text-justify">
              We, at Link Agro Exports, adhere to the highest quality standards
              and consistently produce flawless end products. We believe our
              success depends on delivering the best possible quality to our
              customers.
              <br />
              <br />
              Our experienced professionals are dedicated to providing
              uninterrupted logistics services to our global clients. The most
              active and efficient employees and talented managers strive
              tirelessly to keep Link Agro Exports at the forefront of the
              industry.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-10 mb-30">
        <Team
          title="Meet Our Professionals"
          description="Our team combines creativity, expertise, and dedication to deliver outstanding solutions for our clients."
          members={teamData}
          gridClass="grid-cols-1 sm:grid-cols-2"
        />
      </div>
    </div>
  );
}

export default About;
