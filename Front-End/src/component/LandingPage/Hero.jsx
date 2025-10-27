import { ArrowRight, Clock, BarChart3, CheckCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import dashboardImage from "../../assets/dental.jpg";
import AuthFormModal from "../../component/Login/Login";

const Hero = () => {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <section className="relative flex min-h-screen items-center overflow-hidden bg-transparent px-4 sm:px-6 md:px-8">
            {/* Animated Orbs & Grid Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/4 top-1/4 h-40 w-40 animate-pulse rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl sm:h-60 sm:w-60 md:h-72 md:w-72"></div>
                <div className="absolute bottom-1/4 right-1/4 h-56 w-56 animate-pulse rounded-full bg-gradient-to-r from-teal-400/15 to-blue-400/15 blur-3xl delay-1000 sm:h-80 sm:w-80 md:h-96 md:w-96"></div>
                <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-gradient-to-r from-indigo-400/10 to-cyan-400/10 blur-2xl delay-500 sm:h-56 sm:w-56 md:h-64 md:w-64"></div>

                <div className="absolute inset-0 opacity-5">
                    <div
                        className="h-full w-full"
                        style={{
                            backgroundImage: "radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.15) 1px, transparent 0)",
                            backgroundSize: "24px 24px",
                        }}
                    ></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container relative z-10 mx-auto w-full max-w-7xl">
                <div className="grid items-center gap-10 xs:gap-4 2xs:gap-0 xs:gap-0 py-10 sm:gap-12 sm:py-14 md:gap-16 md:py-16 lg:grid-cols-2 lg:py-20">
                    {/* Left: Text & CTA */}
                    <div className="space-y-7 sm:space-y-8">
                        <div className="space-y-4 sm:space-y-5">
                            {/* Animated Heading */}
                            <motion.h1
                                className="text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl mt-12"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: {},
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.15,
                                            delayChildren: 0.2,
                                        },
                                    },
                                }}
                            >
                                <motion.span
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
                                    }}
                                >
                                    Doc. Saclolo
                                </motion.span>
                                <br />
                                <motion.span
                                    className="bg-gradient-to-r from-blue-600  to-teal-600 bg-clip-text text-transparent"
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
                                    }}
                                >
                                    Dental Care
                                </motion.span>
                                <br />
                                <motion.span
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
                                    }}
                                >
                                    System
                                </motion.span>
                            </motion.h1>

                            {/* Animated Subtitle */}
                            <motion.p
                                className="max-w-2xl text-sm leading-relaxed text-white sm:text-base md:text-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                            >
                                Transform your dental practice with comprehensive patient monitoring, seamless appointment management, and real-time
                                analytics that drive better patient outcomes.
                            </motion.p>
                        </div>

                        {/* Animated CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                        >
                            <button
                                onClick={() => setShowLogin(true)}
                                className="group relative transform overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:px-6 sm:py-3 md:px-8 md:py-4 md:text-base"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <div className="relative flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
                                    <span>Login</span>
                                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                </div>
                            </button>
                        </motion.div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5">
                            {[
                                { icon: Clock, title: "Real-time", subtitle: "Live monitoring", color: "from-blue-500 to-blue-600" },
                                { icon: BarChart3, title: "Analytics", subtitle: "Smart insights", color: "from-purple-500 to-purple-600" },
                            ].map((benefit, index) => (
                                <div
                                    key={index}
                                    className="group"
                                >
                                    <div className="flex transform items-center gap-2.5 rounded-xl border border-white/20 bg-white/70 p-2.5 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-3 md:p-4">
                                        <div
                                            className={`h-9 w-9 flex-shrink-0 bg-gradient-to-r ${benefit.color} flex items-center justify-center rounded-xl shadow transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10 md:h-12 md:w-12`}
                                        >
                                            <benefit.icon className="h-4 w-4 text-white sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 sm:text-base md:text-lg">{benefit.title}</p>
                                            <p className="text-xs text-gray-600 sm:text-sm md:text-base">{benefit.subtitle}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Image Preview */}
                    <div className="relative mt-8 sm:mt-5 lg:mt-0">
                        <div className="group relative mx-auto max-w-lg">
                            <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 opacity-30 blur-xl transition-opacity duration-300 group-hover:opacity-50 sm:-inset-3"></div>
                            <div className="relative overflow-hidden rounded-3xl bg-white p-1.5 shadow-2xl sm:p-2">
                                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gray-100">
                                    <img
                                        src={dashboardImage}
                                        alt="Dashboard Preview"
                                        className="h-full w-full rounded-2xl object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Floating Cards - Hidden on small screens */}
                        <div className="hidden sm:block">
                            <div className="absolute -bottom-5 -left-5 animate-pulse rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl backdrop-blur-sm sm:-bottom-6 sm:-left-6 sm:p-4 md:-bottom-8 md:-left-8 md:p-6">
                                <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 sm:h-10 sm:w-10 md:h-12 md:w-12">
                                        <CheckCircle className="h-4 w-4 text-white sm:h-5 sm:w-5 md:h-6 md:w-6" />
                                    </div>
                                    <div>
                                        <p className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-xl font-black text-transparent sm:text-2xl md:text-3xl">
                                            98%
                                        </p>
                                        <p className="text-xs font-medium text-gray-600 sm:text-sm md:text-base">Patient Satisfaction</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-5 -top-5 rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl backdrop-blur-sm sm:-right-6 sm:-top-6 sm:p-4 md:-right-8 md:-top-8 md:p-5">
                                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                                    <div className="relative">
                                        <div className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-gradient-to-r from-green-400 to-emerald-500 sm:h-3 sm:w-3 md:h-4 md:w-4"></div>
                                        <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 sm:h-3 sm:w-3 md:h-4 md:w-4"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 sm:text-base md:text-lg">Live Monitoring</p>
                                        <p className="text-[10px] text-gray-600 sm:text-xs md:text-sm">12 patients active</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 transform rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2.5 text-center text-white shadow-lg sm:-right-4 sm:rounded-xl sm:p-3 md:-right-6 md:p-4">
                                <p className="text-sm font-bold sm:text-base md:text-lg">RealTime</p>
                                <p className="text-[9px] opacity-90 sm:text-[10px] md:text-xs">Realtime Notification</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
              {/* Login Modal */}
                <AuthFormModal
                    isOpen={showLogin}
                    onClose={() => setShowLogin(false)}
                />
            {/* Wave at bottom */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 150"
                    className="h-auto w-full"
                    preserveAspectRatio="none"
                >
                    <path
                        fill="#dbeafe"
                        d="M0,40 L500,40 L820,400 L1000,600 L1000,200 L0,150 Z"
                    />
                </svg>
            </div>
        </section>
        
    );
};

export default Hero;