import React, { useState } from "react";
import { Check, ChevronDown, ChevronUp, Star } from "lucide-react";
import { useInView } from "react-intersection-observer";
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
              className={`relative bg-white shadow-lg rounded-2xl p-8 flex flex-col transition hover:shadow-2xl animate__animated ${animationClass}  ${
                plan.highlight ? "border-2 border-primary scale-105" : ""
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
              <button
                className={`mt-8 w-full py-3 rounded-xl font-medium transition cursor-pointer ${
                  plan.highlight
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Get Started
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;

// const plans = [
//     {
//       id: "free",
//       name: "Free",
//       price: 0,
//       description: "Basic features for individuals",
//       features: [
//         { id: 1, text: "Access to core features" },
//         { id: 2, text: "1 Project" },
//         { id: 3, text: "Community Support" },
//         { id: 4, text: "Basic Analytics" },
//         { id: 5, text: "Email Alerts" },
//         { id: 6, text: "Single User" },
//         { id: 7, text: "Basic Templates" },
//         { id: 8, text: "Limited Storage" },
//       ],
//     },
//     {
//       id: "pro",
//       name: "Pro",
//       price: 15,
//       description: "Advanced features for professionals",
//       highlight: true, // highlight this plan
//       features: [
//         { id: 1, text: "Everything in Free" },
//         { id: 2, text: "Unlimited Projects" },
//         { id: 3, text: "Priority Support" },
//         { id: 4, text: "Advanced Analytics" },
//         { id: 5, text: "Team Collaboration" },
//         { id: 6, text: "Export Data" },
//         { id: 7, text: "Custom Branding" },
//         { id: 8, text: "Cloud Backup" },
//         { id: 9, text: "Role Management" },
//       ],
//     },
//     {
//       id: "premium",
//       name: "Premium",
//       price: 30,
//       description: "All features for large teams",
//       features: [
//         { id: 1, text: "Everything in Pro" },
//         { id: 2, text: "Dedicated Manager" },
//         { id: 3, text: "Custom Integrations" },
//         { id: 4, text: "API Access" },
//         { id: 5, text: "Advanced Security" },
//         { id: 6, text: "24/7 Support" },
//         { id: 7, text: "Custom Workflows" },
//         { id: 8, text: "Unlimited Storage" },
//       ],
//     },
//   ];
//   <Pricing plans={plans} />
