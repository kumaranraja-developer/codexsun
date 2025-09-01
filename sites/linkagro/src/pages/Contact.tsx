import Contact1 from "../../../../resources/layouts/contactLayouts/Contact1";
import { FaIndustry } from "react-icons/fa";
import { IoBusiness } from "react-icons/io5";
import { TbTruckDelivery } from "react-icons/tb";
function Contact() {
    

  return (
    <div className="px-4 lg:px-[10%] my-25">
      <Contact1
        addresses={[
          {
            title: "Registered Office",
            details: `Link Agro Exports
No: 3/306-A, Thandradevi Pattinam,
Paramakudi-623707
Ramnad District.`,
icon: IoBusiness ,
          },
          {
            title: "Logistics Centre",
            details: `Link Agro Exports
274, North Masi Street,
Madurai – 625001`,
icon: TbTruckDelivery ,
          },
          {
            title: "Plant Address",
            details: `Tamarakularm,
Uchipuli Post,
Ramanathapuram District
Tamilnadu - 623534`,
icon: FaIndustry,
          },
        ]}
        socialLinks={[
          {
            id: "instagram",
            href: "linkagroexports",
            img: "/assets/svg/instagram.svg",
            alt: "Instagram",
          },
          {
            id: "whatsapp",
            href: "917395944679",
            img: "/assets/svg/whatsapp.svg",
            alt: "WhatsApp",
          },
          {
            id: "email",
            href: "exports@linkagro.in",
            img: "/assets/svg/email.svg",
            alt: "WhatsApp",
          },
          {
            id: "phone",
            href: "9894864679",
            img: "/assets/svg/phone.svg",
            alt: "WhatsApp",
          },
        ]}
        iconSize="w-8 h-8"
      />
    </div>
  );
}

export default Contact;
