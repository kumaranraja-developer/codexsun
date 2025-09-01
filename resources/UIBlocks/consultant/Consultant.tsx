import React, { useEffect, useState } from "react";
import { Link as ScrollLink } from "react-scroll";

type CompanyInfoItem = {
  icon: string;
  count: number;
  symbol: string;
  field: string;
};

type CTAContent = {
  title: string;
  buttonText: string;
  buttonLink: string; // scroll id or external link
};

type StatsSectionProps = {
  companyInfo: CompanyInfoItem[];
  backgroundImage: string;
  cta: CTAContent;
  enableConsultation?: boolean; // toggle for consultation block
};

export default function StatsSection({
  companyInfo,
  backgroundImage,
  cta,
  enableConsultation = false,
}: StatsSectionProps) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const section = document.getElementById("stats-section");
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setInView(entry.isIntersecting));
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  return (
    <div id="stats-section" className="relative w-full">
      {/* Background Image (fixed, parallax feel) */}
      <div
        className={`absolute inset-0 bg-fixed bg-cover bg-center transition-opacity duration-700 ${
          inView ? "opacity-90" : "opacity-0"
        }`}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-primary/85"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* CTA Section */}
        <div className="px-5 lg:px-[12%] py-10 flex flex-col sm:flex-row justify-between">
          <div className="sm:w-3/5 px-5">
            <h1 className="text-2xl md:text-4xl text-primary-foreground my-5 font-bold">
              {cta.title}
            </h1>
          </div>
          <div className="sm:w-1/4 flex items-center justify-center">
            {cta.buttonLink.startsWith("#") ? (
              <ScrollLink
                to={cta.buttonLink.replace("#", "")}
                smooth={true}
                duration={600}
                offset={-70}
                className="bg-primary-foreground w-max font-semibold text-primary rounded-sm border border-ring/30 hover:bg-primary hover:border-ring hover:text-primary-foreground px-4 py-2 text-center text-sm md:text-xl cursor-pointer transition-all duration-300"
              >
                {cta.buttonText}
              </ScrollLink>
            ) : (
              <a
                href={cta.buttonLink}
                className="bg-primary-foreground w-max font-semibold text-primary rounded-sm border border-ring/30 hover:bg-primary hover:text-primary-foreground px-4 py-2 text-center text-sm md:text-xl cursor-pointer"
              >
                {cta.buttonText}
              </a>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-5 py-10 lg:px-[12%] grid grid-cols-1 lg:grid-cols-4 gap-10">
          {companyInfo.map((item, index) => {
            const [count, setCount] = useState(0);

            useEffect(() => {
              if (inView) {
                let start = 0;
                const duration = 1500; // 1.5s
                const stepTime = 20;
                const increment = Math.ceil(item.count / (duration / stepTime));

                const timer = setInterval(() => {
                  start += increment;
                  if (start >= item.count) {
                    start = item.count;
                    clearInterval(timer);
                  }
                  setCount(start);
                }, stepTime);

                return () => clearInterval(timer);
              } else {
                setCount(0); // reset when not in view
              }
            }, [inView, item.count]);

            return (
              <div
                key={index}
                className="flex flex-col justify-center gap-3 items-center border-b lg:border-0 border-ring/30 last:border-b-0 pb-3"
              >
                <img
                  className="w-14 h-14 object-contain"
                  src={item.icon}
                  alt={item.field}
                  loading="lazy"
                />
                <div className="text-5xl text-primary-foreground font-semibold">
                  {count}
                  {item.symbol && <span>{item.symbol}</span>}
                </div>
                <div className="text-primary-foreground uppercase text-xl">
                  {item.field}
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional Consultation Section */}
        {enableConsultation && (
          <div className="px-5 lg:px-[12%] py-12 bg-primary/95">
            <div className="flex flex-col sm:flex-row justify-between">
              <div className="sm:w-3/5 px-5">
                <h1 className="text-2xl text-primary-foreground my-5 font-semibold">
                  Start your ERP journey with a free consultation today.
                </h1>
              </div>
              <div className="sm:w-1/4 flex items-center justify-center">
                <ScrollLink
                  to="contact"
                  smooth={true}
                  duration={600}
                  offset={-70}
                  className="bg-primary-foreground w-max font-semibold text-primary rounded-sm border border-ring/30 hover:bg-primary hover:border-ring hover:text-primary-foreground px-4 py-2 text-center text-sm md:text-xl cursor-pointer"
                >
                  CONTACT US
                </ScrollLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
