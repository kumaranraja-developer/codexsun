import Button from "../../components/button/Button";
import { IconType } from "react-icons"; // type for icons

export type ContactItem = {
  icon: IconType; // pass the React icon component
  value: string; // e.g. "+91 98765 43210", "info@logicx.com"
  href?: string;
};

interface ContactHeaderProps {
  contacts: ContactItem[];
  buttonLabel: string;
}

function ContactHeader({ contacts, buttonLabel }: ContactHeaderProps) {
  return (
    <div className="flex flex-row justify-between bg-primary text-primary-background items-center gap-6 text-center">
      {/* Contacts */}
      <div className="flex flex-row gap-4">
        {contacts.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <IconComponent className="w-4 h-4" />
              <a href={item.href} target="_blank">{item.value}</a>
            </div>
          );
        })}
      </div>

      {/* Button */}
      <Button
        label={buttonLabel}
        className="bg-foreground text-background !rounded-full hover:bg-background hover:text-foreground"
      />
    </div>
  );
}

export default ContactHeader;
