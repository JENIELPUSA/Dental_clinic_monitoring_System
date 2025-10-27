import { CheckCircle, Clock, Shield, Smile, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import brushingImage from "../../assets/imagehero1.jpg";
import checkupImage from "../../assets/imagehero2.jpg";
import clockImage from "../../assets/imagehero3.jpg";
import healthyImage from "../../assets/imagehero4.jpg";
const Dashboard = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600";

const Benefits = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeMetric, setActiveMetric] = useState(0);
  const [activeBenefit, setActiveBenefit] = useState(0);
  const sectionRef = useRef(null);

  const dentalBenefits = [
    {
      icon: Shield,
      title: "Prevent Cavities",
      description: "Avoid costly dental procedures by keeping your teeth protected from decay.",
      image: checkupImage,
    },
    {
      icon: Smile,
      title: "Maintain Bright Smile",
      description: "Achieve a radiant smile that boosts your confidence.",
      image: brushingImage,
    },
    {
      icon: Clock,
      title: "Save Time on Treatments",
      description: "Early checkups prevent major dental problems.",
      image: clockImage,
    },
    {
      icon: CheckCircle,
      title: "Improve Oral Health",
      description: "Regular care strengthens gums and teeth for life.",
      image: healthyImage,
    },
  ];

  const features = [
    { text: "Real-time patient monitoring", premium: true },
    { text: "Instant appointment reminders", premium: true },
    { text: "Automated scheduling", premium: false },
    { text: "Digital treatment history", premium: false },
    { text: "Smart analytics dashboard", premium: true },
  ];

  const floatingMetrics = [
    { value: "24", label: "Patients Today", icon: Users, color: "text-blue-600" },
    { value: "100%", label: "System Uptime", icon: Shield, color: "text-green-600" },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((p) => (p + 1) % floatingMetrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBenefit((p) => (p + 1) % dentalBenefits.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextBenefit = () => setActiveBenefit((p) => (p + 1) % dentalBenefits.length);
  const prevBenefit = () => setActiveBenefit((p) => (p - 1 + dentalBenefits.length) % dentalBenefits.length);

  return (
    <section
      ref={sectionRef}
      className="relative py-3 2xs:py-4 xs:py-5 sm:py-6 md:py-8 lg:py-10 bg-blue-100 overflow-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 overflow-hidden">
        <div className="grid gap-3 xs:gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2 items-start lg:items-center">
          {/* LEFT: Text + Carousel */}
          <div className={`space-y-2 xs:space-y-3 sm:space-y-4 md:space-y-5 transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <div className="text-center lg:text-left">
              <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-slate-900 leading-tight">
                Keep Your{" "}
                <span className="text-blue-600 block sm:inline">Smile Bright</span>{" "}
                <span className="block mt-0.5 xs:mt-1 sm:mt-1.5 md:mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  For Life
                </span>
              </h2>
              <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base text-slate-600 mt-1.5 xs:mt-2 sm:mt-3 md:mt-4 max-w-full mx-auto lg:mx-0 px-1">
                Discover tech-powered dental care for a healthier, brighter, and more confident smile.
              </p>
            </div>

            {/* Carousel */}
            <div className="relative w-full overflow-hidden rounded-lg xs:rounded-xl shadow border border-white/50 bg-white/80 backdrop-blur-sm">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeBenefit * 100}%)` }}
              >
                {dentalBenefits.map((benefit, i) => (
                  <div key={i} className="flex-shrink-0 w-full p-2 xs:p-2.5 sm:p-3 md:p-4">
                    <div className="aspect-[4/3] w-full rounded overflow-hidden mb-1.5 xs:mb-2">
                      <img src={benefit.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-[10px] xs:text-xs sm:text-sm md:text-base font-bold text-slate-800 flex items-center gap-1 xs:gap-1.5">
                      <benefit.icon className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                      {benefit.title}
                    </h3>
                    <p className="text-[8px] xs:text-[9px] sm:text-xs md:text-sm text-slate-600 mt-1 xs:mt-1.5 leading-tight">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={prevBenefit}
                className="absolute left-1 xs:left-1.5 sm:left-2 top-1/2 -translate-y-1/2 bg-white/90 p-1 xs:p-1.5 rounded-full shadow-sm hover:bg-white transition-colors hidden xs:block"
              >
                <ChevronLeft className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-slate-700" />
              </button>
              <button
                onClick={nextBenefit}
                className="absolute right-1 xs:right-1.5 sm:right-2 top-1/2 -translate-y-1/2 bg-white/90 p-1 xs:p-1.5 rounded-full shadow-sm hover:bg-white transition-colors hidden xs:block"
              >
                <ChevronRight className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-slate-700" />
              </button>

              <div className="absolute bottom-1 xs:bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5 xs:gap-1">
                {dentalBenefits.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBenefit(i)}
                    className={`h-0.5 xs:h-1 w-0.5 xs:w-1 rounded-full ${activeBenefit === i ? "bg-blue-600 w-2 xs:w-3" : "bg-gray-400"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Image + Metrics — ORIGINAL POSITIONING RESTORED */}
          <div
            className={`relative transition-opacity duration-700 delay-150 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-white/30 w-full">
              {/* Use aspect-ratio container to prevent overflow */}
              <div className="aspect-[16/9] w-full relative">
                <img
                  src={Dashboard}
                  alt="Dashboard Preview"
                  className="w-full h-full object-cover" // ✅ changed from object-contain to object-cover
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 pointer-events-none"></div>

                {/* Floating Metrics — Desktop only (lg+) */}
                <div className="hidden lg:block">
                  {floatingMetrics.map((metric, index) => {
                    const IconComponent = metric.icon;
                    return (
                      <div
                        key={index}
                        className={`absolute bg-white/90 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl shadow-lg border border-white/20 transition-all duration-500 ${
                          activeMetric === index ? "scale-105 shadow-xl" : "scale-100"
                        }`}
                        style={{
                          top: index === 0 ? "1rem" : "auto",
                          bottom: index === 1 ? "1rem" : "auto",
                          right: "1rem",
                          zIndex: 10,
                        }}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${metric.color}`} />
                          <div className="break-words">
                            <p className={`text-xs sm:text-sm font-bold ${metric.color}`}>{metric.value}</p>
                            <p className="text-[9px] sm:text-[10px] text-slate-600 whitespace-nowrap">{metric.label}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Metrics — below image */}
            <div className="flex justify-center gap-2.5 sm:gap-3 mt-3 sm:mt-4 lg:hidden flex-wrap px-1">
              {floatingMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/90 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl shadow border border-white/20 flex-1 max-w-[130px] min-w-[100px]"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 break-words justify-center sm:justify-start">
                      <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${metric.color}`} />
                      <div className="text-center sm:text-left">
                        <p className={`text-xs sm:text-sm font-bold ${metric.color}`}>{metric.value}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-600">{metric.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className={`mt-3 xs:mt-4 sm:mt-5 md:mt-6 lg:mt-8 transition-opacity duration-700 delay-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <h3 className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-center text-slate-800 mb-2 xs:mb-2.5">
            Why Choose Us?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 max-w-4xl mx-auto px-1">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-1 xs:gap-1.5 p-2 xs:p-2.5 md:p-3 rounded-lg bg-white/70">
                <CheckCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-[8px] xs:text-[9px] sm:text-xs md:text-sm lg:text-base text-slate-700">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;