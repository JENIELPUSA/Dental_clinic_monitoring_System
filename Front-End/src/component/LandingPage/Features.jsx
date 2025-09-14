import { 
  Monitor, 
  Calendar, 
  FileText, 
  BarChart3, 
  Shield, 
  Bell,
  Heart,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Features = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isVisible, setIsVisible] = useState({});
  const sectionRefs = useRef([]);

  const features = [
    {
      icon: Monitor,
      title: "Real-time Patient Monitoring",
      description: "Track vital signs, treatment progress, and patient status in real-time with our advanced monitoring dashboard.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      gradient: "from-blue-500 to-cyan-500",
      stats: "24/7 monitoring"
    },
    {
      icon: Calendar,
      title: "Smart Appointment Scheduling",
      description: "Automated scheduling system with conflict detection, reminder notifications, and optimal time slot suggestions.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      gradient: "from-purple-500 to-pink-500",
      stats: "98% efficiency rate"
    },
    {
      icon: FileText,
      title: "Digital Patient Records",
      description: "Comprehensive digital health records with treatment history, X-rays, and notes accessible instantly.",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      gradient: "from-emerald-500 to-teal-500",
      stats: "Instant access"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Detailed insights into clinic performance, patient trends, and treatment outcomes with customizable reports.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      gradient: "from-orange-500 to-red-500",
      stats: "50+ metrics"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Automated alerts for appointments, treatment reminders, follow-ups, and emergency situations.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      gradient: "from-yellow-500 to-orange-500",
      stats: "Zero missed alerts"
    },
    {
      icon: Heart,
      title: "Patient Care Workflows",
      description: "Customizable care protocols and automated follow-up sequences to enhance patient experience.",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      gradient: "from-pink-500 to-rose-500",
      stats: "95% satisfaction"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVisible(prevState => ({
            ...prevState,
            [entry.target.dataset.index]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.3 }
    );

    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_70%)]"></div>
      
      <div className="container mx-auto px-6 lg:px-8 relative">
        <div className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Comprehensive Features
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Comprehensive Clinic Management
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Everything you need to run a modern dental practice efficiently, 
            from patient monitoring to analytics, all in one powerful platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const isHovered = hoveredIndex === index;
            const isVisibleNow = isVisible[index];
            
            return (
              <div 
                key={index}
                data-index={index}
                ref={el => sectionRefs.current[index] = el}
                className={`group relative p-8 rounded-3xl bg-white backdrop-blur-sm border border-gray-200 hover:border-transparent hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer overflow-hidden transform-gpu ${isVisibleNow ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
                style={{ animationDelay: `${index * 150}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
                
                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                
                <div className="relative space-y-6">
                  {/* Icon with enhanced animation */}
                  <div className="flex items-center justify-between">
                    <div className={`relative w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      {/* Glowing effect */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur transition-all duration-500`}></div>
                      <IconComponent className={`relative w-8 h-8 ${feature.color} transition-colors duration-300`} />
                    </div>
                    
                    {/* Stats badge */}
                    <div className={`px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-150`}>
                      {feature.stats}
                    </div>
                  </div>

                  {/* Title with enhanced typography */}
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed text-base">
                    {feature.description}
                  </p>

                  {/* CTA Arrow */}
                  <div className="flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">
                    <span className="text-sm mr-2">Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>

                  {/* Floating particles animation */}
                  {isHovered && (
                    <>
                      <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                      <div className="absolute bottom-8 left-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
                      <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce"></div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Tailwind CSS keyframes for the scroll effect */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default Features;