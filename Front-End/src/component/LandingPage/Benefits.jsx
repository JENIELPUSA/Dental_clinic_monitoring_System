import { CheckCircle, TrendingUp, Clock, DollarSign, Play, Star, Users, Shield, Smile} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import local images
import brushingImage from "../../assets/imagehero1.jpg";
import checkupImage from "../../assets/imagehero2.jpg";
import clockImage from "../../assets/imagehero3.jpg";
import healthyImage from "../../assets/imagehero4.jpg";
import Dashboard from "../../assets/imagehero.jpg"

const Benefits = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeMetric, setActiveMetric] = useState(0);
  const [activeBenefit, setActiveBenefit] = useState(0);
  const sectionRef = useRef(null);

  const dentalBenefits = [
    {
      icon: Shield,
      title: "Prevent Cavities",
      description: "Regular dental maintenance helps prevent cavities and keeps your teeth healthy.",
      image: checkupImage,
    },
    {
      icon: Smile,
      title: "Maintain Bright Smile",
      description: "Professional cleaning and care maintain your teeth’s whiteness and shine.",
      image: brushingImage,
    },
    {
      icon: Clock,
      title: "Save Time on Treatments",
      description: "Routine check-ups reduce the need for lengthy dental procedures later.",
      image: clockImage,
    },
    {
      icon: CheckCircle,
      title: "Improve Oral Health",
      description: "Regular maintenance ensures overall oral hygiene and prevents future problems.",
      image: healthyImage,
    },
  ];

  const features = [
    { text: "Real-time patient monitoring", premium: true },
    { text: "Real-time Notification", premium: true },
    { text: "Automated appointment scheduling", premium: false },
    { text: "Digital treatment records", premium: false },
    { text: "Advanced analytics dashboard", premium: true }
  ];

  const floatingMetrics = [
    { value: "24", label: "Patients Today", icon: Users, color: "text-blue-600" },
    { value: "100%", label: "System Uptime", icon: Shield, color: "text-green-600" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % floatingMetrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [floatingMetrics.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBenefit((prev) => (prev + 1) % dentalBenefits.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [dentalBenefits.length]);

  const nextBenefit = () => {
    setActiveBenefit((prev) => (prev + 1) % dentalBenefits.length);
  };

  const prevBenefit = () => {
    setActiveBenefit((prev) => (prev - 1 + dentalBenefits.length) % dentalBenefits.length);
  };

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-10">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Section */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                 Protect Your Teeth
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                   for a Lifetime of Health
                </span>
                and Confidence
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
               Learn the most effective ways to prevent common dental issues like cavities and gum disease through proactive care and professional support.
              </p>
            </div>

            {/* Benefits Carousel */}
            <div className="relative w-full overflow-hidden rounded-2xl shadow-xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeBenefit * 100}%)` }}
              >
                {dentalBenefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-full p-6 bg-white/80 backdrop-blur-sm"
                  >
                    <div className="space-y-4">
                      <img src={benefit.image} alt={benefit.title} className="w-full h-auto rounded-lg" />
                      <h3 className="font-bold text-slate-800 mt-4">{benefit.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel Controls */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4">
                <button
                  onClick={prevBenefit}
                  className="p-2 bg-white/50 backdrop-blur-sm rounded-full shadow-lg text-slate-600 hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <button
                  onClick={nextBenefit}
                  className="p-2 bg-white/50 backdrop-blur-sm rounded-full shadow-lg text-slate-600 hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Carousel Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {dentalBenefits.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveBenefit(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${activeBenefit === index ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300'}`}
                  ></button>
                ))}
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Features:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-white/50 transition-colors group ${isVisible ? 'animate-fade-in' : ''}`}
                    style={{ animationDelay: `${(index + 4) * 100}ms` }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-slate-700 group-hover:text-slate-900 transition-colors">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
         {/* Dashboard Preview */}
          <div className={`relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-white to-slate-100 ">
              {/* Ang mock dashboard ay pinalitan na ng image */}
              <img 
                src={Dashboard}
                alt="Dental Clinic Dashboard Preview"
                className="w-full h-auto rounded-2xl"
              />
              {/* Overlay for visual effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
            </div>

            {/* Floating Metrics */}
            {floatingMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div
                  key={index}
                  className={`absolute bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/20 transition-all duration-500 ${
                    activeMetric === index ? 'scale-110 shadow-2xl' : 'scale-100'
                  }`}
                  style={{
                    top: index === 0 ? '-1rem' : index === 1 ? '50%' : 'auto',
                    bottom: index === 2 ? '-1rem' : 'auto',
                    left: index === 0 ? '-1rem' : index === 2 ? '-1rem' : 'auto',
                    right: index === 1 ? '-2rem' : 'auto',
                    transform: index === 1 ? 'translateY(-50%)' : 'none'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-5 h-5 ${metric.color}`} />
                    <div>
                      <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
                      <p className="text-xs text-slate-600">{metric.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pulsing Connection Lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-8 left-8 w-16 h-0.5 bg-gradient-to-r from-blue-400 to-transparent animate-pulse"></div>
              <div className="absolute bottom-8 right-8 w-16 h-0.5 bg-gradient-to-l from-purple-400 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;