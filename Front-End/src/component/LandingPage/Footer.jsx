import { Monitor, Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from "lucide-react";

const Footer = () => {
    const socialLinks = [
        { name: "Twitter", icon: Twitter, href: "#twitter" },
        { name: "LinkedIn", icon: Linkedin, href: "#linkedin" },
        { name: "Facebook", icon: Facebook, href: "#facebook" },
    ];

    return (
        <footer className="bg-muted border-border border-t py-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-white ">
            <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 md:flex-row lg:px-8">
                {/* Branding */}
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-hero flex h-10 w-10 items-center justify-center rounded-xl">
                        <Monitor className="h-6 w-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-foreground text-lg font-bold">Doc. Saclolo</h1>
                        <p className="text-muted-foreground text-xs">Dental Care System</p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm md:items-end">
                    <div className="flex items-center gap-2">
                        <Phone className="text-primary h-4 w-4" /> (555) 123-4567
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="text-primary h-4 w-4" /> support@docsaclolo.com
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="text-primary h-4 w-4" /> Naval Biliran
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
                                className="bg-background text-muted-foreground hover:text-primary hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded transition-all duration-200"
                                aria-label={social.name}
                            >
                                <IconComponent className="h-4 w-4" />
                            </a>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Copyright */}
            <div className="border-border text-muted-foreground mt-6 border-t pt-4 text-center text-sm">
                © 2024 Doc.SacloloDentalCare. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
