import { Monitor, Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "#twitter" },
    { name: "LinkedIn", icon: Linkedin, href: "#linkedin" },
    { name: "Facebook", icon: Facebook, href: "#facebook" },
  ];

  return (
    <footer className="bg-muted border-t border-border py-8">
      <div className="container mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">DentalMonitor</h1>
            <p className="text-xs text-muted-foreground">Clinic Management System</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col items-center md:items-end gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" /> (555) 123-4567
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> support@dentalmonitor.com
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Naval Biliran
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <a
                key={social.name}
                href={social.href}
                className="w-8 h-8 bg-background rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                aria-label={social.name}
              >
                <IconComponent className="w-4 h-4" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
        © 2024 DentalMonitor. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
