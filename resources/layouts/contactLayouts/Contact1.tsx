import { FaHome, FaPhoneAlt } from "react-icons/fa";
import FloatContact from "../../UIBlocks/contact/FloatContact";
import { IconType } from "react-icons";
import Button from '../../components/button/Button'
type SocialLink = {
  id: string;
  href: string;
  img: string;
  alt: string;
};
type AddressItem = {
  title: string;
  details: string;
  email?: string;
  icon: IconType;
};
type ContactProps = {
  title?: string;
  image?: string;
  addresses: AddressItem[];
  socialLinks: SocialLink[];
  iconSize: string;
};

export default function Contact1({
  title = "Contact Us",
  addresses,
  socialLinks,
  iconSize,
}: ContactProps) {
  return (
    <div className="">
      <h1 className="sr-only">{title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Image Section */}

        {/* Form Section */}
        <form className="flex flex-col space-y-4 md:px-[10%]">
          <div>
            <label htmlFor="name" className="text-foreground text-lg">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-black"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-foreground text-lg">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-black"
            />
          </div>
          <div>
            <label htmlFor="message" className="text-foreground text-lg">
              Message
            </label>
            <textarea
              name="message"
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-black"
              rows={5}
            />
          </div>
          <Button
            type="button"
            label="Submit"
            className="bg-primary hover:bg-hover text-create-foreground py-2 px-6 rounded-md font-semibold cursor-pointer"
          />
        </form>

        {/* Address & Social Section */}
        <div className="space-y-8 text-background">
          {/* Multiple addresses */}
          {addresses.map((addr, idx) => {
            const Icon = addr.icon; 
            return (
              <div key={idx} className="flex items-start space-x-3 md:w-[80%]">
                <Icon className="text-2xl block my-auto text-foreground shrink-0" />{" "}
                {/* dynamic */}
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    {addr.title}
                  </h3>
                  <p className="text-foreground/70">{addr.details}</p>
                  {addr.email && (
                    <a
                      href={`mailto:${addr.email}`}
                      className="block text-primary mt-1"
                    >
                      {addr.email}
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          <FloatContact
            contacts={socialLinks.map((link) => {
              // Detect platform from URL
              let id: string = "link";
              if (link.id === "whatsapp") id = "whatsapp";
              else if (link.id === "instagram") id = "instagram";
              else if (link.id === "facebook") id = "facebook";
              else if (link.id === "linkedin") id = "linkedin";
              else if (link.id === "email") id = "email";
              else if (link.id === "phone") id = "phone";

              return {
                id,
                contact: link.href,
                imgPath: link.img,
                defaultMessage:
                  id === "whatsapp"
                    ? "Hello, I’m interested in this product. Could you please share more details?"
                    : undefined,
              };
            })}
            className=""
            horizontal={true}
            labelPosition="top"
            iconSize={iconSize}
          />
        </div>
      </div>
    </div>
  );
}
