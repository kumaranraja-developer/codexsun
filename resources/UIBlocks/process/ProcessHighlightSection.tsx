import React from "react";

type Step = {
  number: string | number;
  title: string;
  description: string;
};

type ProcessHighlightSectionProps = {
  title: string;
  description: string;
  imageUrl: string;
  steps: Step[];
  bgimage: string;
};

const ProcessHighlightSection: React.FC<ProcessHighlightSectionProps> = ({
  title,
  description,
  imageUrl,
  steps,
  bgimage,
}) => {
  return (
    <section className="bg-primary text-foreground py-12 px-6 lg:px-20 relative z-10">
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src={bgimage}
          alt="background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/80" />
      </div>
      <div className="grid lg:grid-cols-2 gap-10 items-center relative">
        {/* Left: Image */}
        <div>
          <img
            src={imageUrl}
            alt={title}
            aria-label={title}
            className="rounded-md shadow-md w-full object-cover"
          />
        </div>

        {/* Right: Text & Steps */}
        <div>
          <h2 className="text-2xl text-primary-foreground md:text-4xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-primary-foreground mb-8">{description}</p>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 rounded-md hover:bg-background group duration-500 transition-all `}
              >
                <span
                  className={`text-5xl font-bold text-primary-foreground group-hover:text-primary`}
                >
                  {step.number.toString().padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg text-primary-foreground group-hover:text-foreground font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-sm text-primary-foreground group-hover:text-foreground/70 text-justify">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessHighlightSection;
