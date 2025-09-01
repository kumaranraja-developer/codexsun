import { Link } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import FooterLink from "./FooterLink";

type FooterPortfolioProps = {
  address: string[];
  contact: string[];
  company: { label: string; link: string }[];
  project: { label: string; link: string }[];
  legal: { label: string; link: string }[];
  brandName: string;
  year: number;
};

function FooterPortfolio({
  address,
  contact,
  company,
  project,
  legal,
  brandName,
  year,
}: FooterPortfolioProps) {
  return (
    <div>
      <FooterLink />

      <footer className="bg-foreground pt-10">
        <div className="mb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 p-5 lg:px-[12%] gap-5 text-background bg-foreground/90">
            
            {/* Address & Contact */}
            <div className="flex flex-col gap-4">
              <div className="text-lg font-bold text-primary">{brandName}</div>
              <div className="flex flex-col gap-2">
                {address.map((item, idx) => (
                  <p className="text-sm" key={idx}>
                    {item}
                  </p>
                ))}
              </div>
              <div>
                {contact.map((item, idx) => (
                  <p className="text-sm" key={idx}>
                    {item}
                  </p>
                ))}
              </div>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-4">
              <div className="text-lg font-bold text-primary">{brandName}</div>
              <div className="flex flex-col gap-2">
                {company.map((item, idx) => (
                  <ScrollLink
                    key={idx}
                    to={item.link}
                    smooth={true}
                    duration={600}
                    offset={-70}
                    activeClass="text-[#6ab48d] border-l-4 border-[#6ab48d] pl-2"
                    className="cursor-pointer text-white hover:text-[#6ab48d] transition-all duration-200 text-sm"
                  >
                    {item.label}
                  </ScrollLink>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="flex flex-col gap-4">
              <div className="text-lg font-bold text-primary">Project</div>
              <div className="flex flex-col gap-2">
                {project.map((item, idx) => (
                  <Link key={idx} className="flex flex-col text-sm" to={item.link}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-4">
              <div className="text-lg font-bold text-primary">Legal</div>
              <div className="flex flex-col gap-2">
                {legal.map((item, idx) => (
                  <Link key={idx} className="flex flex-col text-sm" to={item.link}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 bg-foreground text-white">
          <div className="text-sm text-center bg-foreground/90 px-2 py-7">
            Copyright &copy; {year} {brandName}. Powered by Aaran
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FooterPortfolio;


 {/* <FooterPortfolio
          address={["123 Street", "Coimbatore", "Tamil Nadu, India - 641001"]}
          contact={["info@techmedia.in", "+91 9843213500"]}
          company={[
            { label: "Home", link: "home" },
            { label: "About Us", link: "about" },
            { label: "Industry", link: "industry" },
            { label: "Services", link: "services" },
            { label: "Contact", link: "contact" },
          ]}
          project={[
            { label: "ERPNext", link: "/billing" },
            { label: "Ecart", link: "/billing" },
            { label: "Portfolio", link: "/portfolio" },
          ]}
          legal={[
            { label: "Privacy Policy", link: "/privacy" },
            { label: "Terms & Conditions", link: "/terms" },
          ]}
          brandName="Tech Media"
          year={2025}
        /> */}