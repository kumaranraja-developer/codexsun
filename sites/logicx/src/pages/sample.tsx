import React from 'react'
import CardView from '../../../../resources/UIBlocks/card/CardView'

function sample() {
    
 const service = [
  {
    id: 1,
    title: "UI/UX Design",
    description:
      "Interfaces that delight users and drive conversions. We design with outcomes in mind.Interfaces that delight users and drive conversions. We design with outcomes in mind.Interfaces that delight users and drive conversions. We design with outcomes in mind.",
    features: [
      "User flows that boost engagement.",
      "Mobile-first, award-worthy interfaces.",
      "Prototypes in 72 hours or less.",
    ],
  },
  {
    id: 2,
    title: "Brand Design",
    description:
      "Visual identities that command attention and build trust. Logos, style guides, and assets crafted to tell your story.Interfaces that delight users and drive conversions. We design with outcomes in mind.Interfaces that delight users and drive conversions. We design with outcomes in mind.",
    features: [
      "Logos with hidden storytelling.",
      "Visual identities built to scale.",
      "Style guides even your interns can use.",
    ],
  },
  {
    id: 3,
    title: "Webflow Development",
    description:
      "Websites that load fast, rank higher, and grow with you. No bloated code—just seamless Webflow experiences.Interfaces that delight users and drive conversions. We design with outcomes in mind.",
    features: [
      "90+ PageSpeed scores guaranteed.",
      "SEO-optimized out of the box.",
      "Editable CMS for non-tech teams.",
    ],
  },
  {
    id: 4,
    title: "No-Code Development",
    description:
      "Launch functional MVPs without engineering headaches. Solutions in weeks, not months.",
    features: [
      "Bubble/FlutterFlow MVPs in 4 weeks.",
      "Complex workflows without engineers.",
      "API integrations that actually work.",
    ],
  },
];
  return (
    <div>
        <CardView items={service} />

    </div>
  )
}

export default sample