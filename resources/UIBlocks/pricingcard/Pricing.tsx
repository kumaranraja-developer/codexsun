import React, { useState } from "react";
import { Check, ChevronDown, ChevronUp, Star } from "lucide-react";
import { useInView } from "react-intersection-observer";
import Button from "../../../resources/components/button/Button";
interface Feature {
  id: number;
  text: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: Feature[];
  highlight?: boolean; // highlight best plan
}

interface PricingProps {
  plans: Plan[];
}

const Pricing: React.FC<PricingProps> = ({ plans }) => {
  const [yearly, setYearly] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (planId: string) => {
    setExpanded((prev) => ({ ...prev, [planId]: !prev[planId] }));
  };

  // const [priceref, inView] = useInView({ triggerOnce: false, threshold: 0.2 });

  return (
    <div className="py-16">
      {/* Heading */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Choose Your Plan</h2>
        <p className="text-gray-500 mt-2">
          Flexible options that scale with your needs
        </p>
      </div>

      {/* Toggle Monthly/Yearly */}
      <div className="flex justify-center mb-10">
        <div className="flex items-center bg-white shadow rounded-full p-2">
          <button
            onClick={() => setYearly(false)}
            className={`px-6 py-2 rounded-full font-medium transition ${
              !yearly ? "bg-primary text-white" : "text-gray-500"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-6 py-2 rounded-full font-medium transition ${
              yearly ? "bg-primary text-white" : "text-gray-500"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
        {plans.map((plan, index) => {
           const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
          const showAll = expanded[plan.id];
          const featuresToShow = showAll
            ? plan.features
            : plan.features.slice(0, 7);

          // figure out which animation to use
          let animationClass = "opacity-0";
          if (inView) {
            if (index === 0) {
              animationClass = "animate__fadeInLeft";
            } else if (index === plans.length - 1) {
              animationClass = "animate__fadeInRight";
            } else {
              animationClass = "animate__fadeInUp";
            }
          }
          return (
            <div
              ref={ref}
              key={plan.id}
              style={{ animationDelay: `${index * 0.2}s` }}
              className={`relative border shadow-lg rounded-2xl p-8 flex flex-col transition hover:shadow-2xl animate__animated ${animationClass}  ${
                plan.highlight ? "border-2 border-primary scale-105" : "bg-background border-ring/30"
              }`}
            >
              {/* Best Plan Badge */}
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <Star size={14} /> Best Value
                </span>
              )}

              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{plan.description}</p>

              {/* Price */}
              <div className="mt-6">
                <span className="text-4xl font-bold">
                  ${yearly ? plan.price * 12 : plan.price}
                </span>
                <span className="text-gray-500">
                  {" "}
                  / {yearly ? "year" : "month"}
                </span>
              </div>

              {/* Features */}
              <ul className="mt-6 flex-1 space-y-3 text-left">
                {featuresToShow.map((feature) => (
                  <li
                    key={feature.id}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <Check className="text-green-500" size={18} />
                    {feature.text}
                  </li>
                ))}
              </ul>

              {/* Show More / Less */}
              {plan.features.length > 7 && (
                <button
                  onClick={() => toggleExpand(plan.id)}
                  className="mt-3 flex items-center text-sm text-primary hover:underline cursor-pointer"
                >
                  {showAll ? (
                    <>
                      Show Less <ChevronUp size={16} className="ml-1" />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown size={16} className="ml-1" />
                    </>
                  )}
                </button>
              )}

              {/* CTA Button */}
              <Button
                className={`mt-8 w-full py-3 rounded-xl font-medium transition cursor-pointer hover:scale-105 ${
                  plan.highlight
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Get Started
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;
