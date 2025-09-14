import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "DDS, Family Dental Care",
      location: "San Francisco, CA",
      rating: 5,
      text: "This monitoring system has completely transformed our practice. Patient wait times are down 40% and our efficiency has skyrocketed. The real-time insights are invaluable.",
      avatar: "SC"
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Oral Surgeon",
      location: "Austin, TX",
      rating: 5,
      text: "The HIPAA compliance and security features give us complete peace of mind. Our patients love the transparency and real-time updates about their treatment progress.",
      avatar: "MR"
    },
    {
      name: "Dr. Emily Watson",
      role: "Pediatric Dentist",
      location: "Miami, FL",
      rating: 5,
      text: "Managing multiple providers and complex schedules used to be a nightmare. Now everything is automated and our team can focus on what matters most - patient care.",
      avatar: "EW"
    }
  ];

  const stats = [
    {
      number: "500+",
      label: "Dental Clinics",
      description: "Trust our platform"
    },
    {
      number: "98%",
      label: "Patient Satisfaction",
      description: "Average rating"
    },
    {
      number: "30%",
      label: "Revenue Increase",
      description: "Average improvement"
    },
    {
      number: "24/7",
      label: "Support Available",
      description: "Always here to help"
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
            Trusted by Leading Dental Professionals
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what dental professionals are saying about our monitoring system 
            and how it's revolutionizing patient care across the country.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2">
              <p className="text-3xl lg:text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                {stat.number}
              </p>
              <p className="font-semibold text-foreground">{stat.label}</p>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="p-6 relative overflow-hidden rounded-xl shadow-lg bg-gradient-card"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-20">
                <Quote className="w-8 h-8 text-primary" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-muted-foreground leading-relaxed italic mb-4">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-primary">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center space-y-8">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                <Star className="w-3 h-3 text-primary" />
              </div>
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <div className="w-6 h-6 bg-accent/20 rounded flex items-center justify-center">
                <Star className="w-3 h-3 text-accent" />
              </div>
              SOC 2 Certified
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <div className="w-6 h-6 bg-medical-green/20 rounded flex items-center justify-center">
                <Star className="w-3 h-3 text-medical-green" />
              </div>
              99.9% Uptime SLA
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
