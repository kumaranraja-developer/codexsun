import { FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

type TeamMember = {
  image: string;
  name: string;
  designation: string;
  bio: string;
  email?: string;
  phone?: string;
};

type TeamProps = {
  title?: string;
  description?: string;
  members: TeamMember[];
  gridClass?: string;
};

function Team({
  title = "Meet Our Team",
  description,
  members,
  gridClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}: TeamProps) {
  return (
    <section className="flex flex-col gap-8 bg-background text-website-foreground">
      {/* Title */}
      <div className="text-center font-bold text-2xl md:text-4xl">{title}</div>

      {/* Description */}
      {description && (
        <div className="text-center md:w-[70%] block mx-auto">
          {description}
        </div>
      )}

      {/* Members Grid */}
      <div className={`grid ${gridClass} sm:px-5 mt-10 gap-y-6 gap-2`}>
        {members.map((member, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 mt-8 sm:mt-0 items-center justify-center"
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-40 h-40 object-cover rounded-full shadow-md"
              loading="lazy"
            />
            <div className="text-2xl mt-5 font-bold">{member.name}</div>
            <div className="text-md font-bold">{member.designation}</div>
            <div className="text-sm text-center px-2">{member.bio}</div>
            <p className="">
              {member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  className="flex items-center gap-1"
                >
                  <FaPhone className="rotate-90 shrink-0 w-5 h-5" />{" "}
                  {member.phone}
                </a>
              )}

              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-1 mt-1"
                >
                  <MdEmail className="shrink-0 w-5 h-5" /> {member.email}
                </a>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Team;
