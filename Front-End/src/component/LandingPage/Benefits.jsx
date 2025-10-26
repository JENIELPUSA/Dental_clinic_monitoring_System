import { CheckCircle, Clock, Shield, Smile, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import brushingImage from "../../assets/imagehero1.jpg";
import checkupImage from "../../assets/imagehero2.jpg";
import clockImage from "../../assets/imagehero3.jpg";
import healthyImage from "../../assets/imagehero4.jpg";
import Dashboard from "../../assets/imagehero.JPG";

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
      description: "Achieve a radiant smile that boosts your confidence and leaves a lasting impression.",
      image: brushingImage,
    },
    {
      icon: Clock,
      title: "Save Time on Treatments",
      description: "Early checkups help you prevent major dental problems and save hours of treatment.",
      image: clockImage,
    },
    {
      icon: CheckCircle,
      title: "Improve Oral Health",
      description: "Regular care strengthens your gums and teeth for a lifetime of perfect smiles.",
      image: healthyImage,
    },
  ];

  const features = [
    { text: "Real-time patient monitoring", premium: true },
    { text: "Instant appointment reminders", premium: true },
    { text: "Automated appointment scheduling", premium: false },
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
    const metricInterval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % floatingMetrics.length);
    }, 3000);
    return () => clearInterval(metricInterval);
  }, [floatingMetrics.length]);

  useEffect(() => {
    const benefitInterval = setInterval(() => {
      setActiveBenefit((prev) => (prev + 1) % dentalBenefits.length);
    }, 5000);
    return () => clearInterval(benefitInterval);
  }, [dentalBenefits.length]);

  const nextBenefit = () => setActiveBenefit((prev) => (prev + 1) % dentalBenefits.length);
  const prevBenefit = () => setActiveBenefit((prev) => (prev - 1 + dentalBenefits.length) % dentalBenefits.length);

  return (
    <section
      ref={sectionRef}
      className="relative py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-100 overflow-hidden"
    >
      {/* Decorative Blurs */}
      <div className="absolute -top-12 -left-12 w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-blue-200 blur-3xl opacity-30 rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-purple-300 blur-3xl opacity-20 rounded-full"></div>

      <div className="container w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-8 sm:gap-10 md:gap-12 lg:gap-16 lg:grid-cols-2 items-center">
          {/* LEFT: Text + Carousel */}
          <div
            className={`space-y-6 sm:space-y-7 md:space-y-8 transition-opacity duration-700 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-slate-900">
                Keep Your{" "}
                <span className="text-blue-600 block sm:inline">Smile Bright</span>{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block mt-1 sm:mt-1.5 md:mt-2">
                  For Life
                </span>
              </h2>

              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 mt-3 sm:mt-4 md:mt-5 lg:mt-6">
                Discover the perfect mix of technology and dental care — designed to make your smile healthier,
                brighter, and more confident than ever before.
              </p>
            </div>

            {/* Benefits Carousel */}
            <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-lg border border-white/50 bg-white/70 backdrop-blur-md">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeBenefit * 100}%)` }}
              >
                {dentalBenefits.map((benefit, index) => (
                  <div key={index} className="flex-shrink-0 w-full p-3 sm:p-4 md:p-5">
                    <img
                      src={benefit.image}
                      alt={benefit.title}
                      className="rounded-lg w-full h-28 sm:h-32 md:h-36 lg:h-40 object-cover mb-2.5 sm:mb-3"
                    />
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 flex items-center gap-1.5 sm:gap-2">
                      <benefit.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
                      {benefit.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 mt-1 sm:mt-1.5">{benefit.description}</p>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevBenefit}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-md hover:bg-white transition-colors sm:left-3"
                aria-label="Previous benefit"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              </button>
              <button
                onClick={nextBenefit}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-md hover:bg-white transition-colors sm:right-3"
                aria-label="Next benefit"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              </button>

              {/* Indicators */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 sm:bottom-3">
                {dentalBenefits.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveBenefit(index)}
                    className={`h-1 w-1 rounded-full transition-all duration-300 ${
                      activeBenefit === index ? "bg-blue-600 w-3" : "bg-gray-300"
                    }`}
                    aria-label={`Go to benefit ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Image + Metrics */}
          <div
            className={`relative transition-opacity duration-700 delay-150 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-white/30">
              <img
                src={Dashboard}
                alt="Dashboard Preview"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
            </div>

            {/* Desktop Floating Metrics */}
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
                      top: index === 0 ? "-0.625rem" : "50%",
                      right: "-0.625rem",
                      transform: index === 1 ? "translateY(-50%)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${metric.color}`} />
                      <div>
                        <p className={`text-xs sm:text-sm font-bold ${metric.color}`}>{metric.value}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-600 whitespace-nowrap">{metric.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile/Tablet Metrics */}
            <div className="flex justify-center gap-2.5 sm:gap-3 mt-3 sm:mt-4 lg:hidden">
              {floatingMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/90 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl shadow border border-white/20 flex-1 max-w-[120px] sm:max-w-[130px]"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${metric.color}`} />
                      <div>
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

        {/* Features Grid */}
        <div
          className={`mt-8 sm:mt-10 md:mt-12 lg:mt-16 transition-opacity duration-700 delay-300 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center text-slate-800 mb-4 sm:mb-5 md:mb-6">
            Why Choose Us?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-1.5 sm:gap-2 p-2.5 sm:p-3 md:p-4 rounded-xl bg-white/60 hover:bg-white shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs md:text-sm text-slate-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;