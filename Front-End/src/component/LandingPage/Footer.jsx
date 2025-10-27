import { Monitor, Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "#twitter" },
    { name: "LinkedIn", icon: Linkedin, href: "#linkedin" },
    { name: "Facebook", icon: Facebook, href: "#facebook" },
  ];

  return (
    <footer className="bg-blue-100 border-t border-gray-200 py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Main Content */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-8">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <Monitor className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-800">Doc. Saclolo</h1>
              <p className="text-xs text-blue-600">Dental Care System</p>
            </div>
          </div>

          {/* Contact Info - Centered on mobile, right-aligned on desktop */}
          <div className="flex flex-col items-center gap-2 text-sm text-blue-700 md:items-end">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" /> (555) 123-4567
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" /> support@docsaclolo.com
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" /> Naval, Biliran
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-colors duration-200"
                  aria-label={social.name}
                >
                  <IconComponent className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-6 border-t border-gray-200 pt-4 text-center text-xs text-blue-600">
          © {new Date().getFullYear()} Doc.SacloloDentalCare. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;