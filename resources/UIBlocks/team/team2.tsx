import React from "react";

type TeamMember = {
  name: string;
  designation: string;
  description: string;
  image: string;
  circleColor: string;
  circlePosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

interface Team2Props {
  members: TeamMember[];
}

const circlePositionClasses: Record<TeamMember["circlePosition"], string> = {
  "top-left": "absolute -top-3 -left-3 lg:-top-4 lg:-left-4",
  "top-right": "absolute -top-3 -right-3 lg:-top-4 lg:-right-4",
  "bottom-left": "absolute -bottom-3 -left-3 lg:-bottom-4 lg:-left-4",
  "bottom-right": "absolute -bottom-3 -right-3 lg:-bottom-4 lg:-right-4",
};

const Team2: React.FC<Team2Props> = ({ members }) => {
  return (
    <section className="py-10">
      <h2 className="text-4xl font-bold mb-15 text-center">Meet the Team</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {members.map((member, index) => {
          const rowIndex = Math.floor(index / 2);
          const isRowReversed = rowIndex % 2 === 1;
          const isMobileReversed = index % 2 === 1;

          return (
            <div
              key={index}
              className={`group flex flex-row gap-8 items-center p-4 rounded-2xl transition-transform duration-300
                ${isMobileReversed ? "flex-row-reverse text-right" : "text-left"}
                ${isRowReversed ? "lg:flex-row-reverse lg:text-right" : "lg:flex-row lg:text-left"}`}
            >
              {/* Image + Background Circle */}
              <div className="relative">
                {/* Circle */}
                <div
                  className={`w-16 h-16 lg:w-28 lg:h-28 rounded-full absolute z-0 ${circlePositionClasses[member.circlePosition]}
                    transition-all duration-500 ease-in-out group-hover:scale-125 group-hover:opacity-0`}
                  style={{ backgroundColor: member.circleColor }}
                />
                {/* Image */}
                <img
                  src={member.image}
                  alt={member.name}
                  className={`w-24 h-24 lg:w-36 lg:h-36 rounded-full object-cover relative z-10 shrink-0
                    transition-transform duration-500 group-hover:scale-105`}
                />
              </div>

              {/* Info */}
              <div
                className={`flex flex-col z-1 ${
                  isMobileReversed
                    ? "items-end text-right"
                    : "items-start text-left"
                } lg:${
                  isRowReversed ? "items-end text-right" : "items-start text-left"
                }`}
              >
                <h3 className="text-2xl font-semibold">{member.name}</h3>
                <p className="text-md text-foreground/70">{member.designation}</p>
                <p className="text-xs text-foreground/50 mt-2">
                  {member.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Team2;
