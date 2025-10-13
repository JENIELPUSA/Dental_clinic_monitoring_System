import { ArrowRight, Clock, BarChart3 } from "lucide-react";
import { useState } from "react";
import dashboardImage from "../../assets/dental.jpg";
import AuthFormModal from "../../component/Login/Login";
import { CheckCircle } from "lucide-react";

const Hero = () => {
    // 1. I-manage ang state para sa modal
    const [showLogin, setShowLogin] = useState(false);

    return (
        <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-10">
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0">
                {/* Animated gradient orbs */}
                <div className="absolute left-1/4 top-1/4 h-72 w-72 animate-pulse rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-teal-400/15 to-blue-400/15 blur-3xl delay-1000"></div>
                <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-gradient-to-r from-indigo-400/10 to-cyan-400/10 blur-2xl delay-500"></div>

                {/* Grid pattern */}
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

            <div className="container relative z-10 mx-auto px-6 lg:px-8">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* Enhanced Content */}
                    <div className="space-y-10">
                        {/* Enhanced Heading */}
                        <div className="space-y-6">
                            <h1 className="text-5xl font-extrabold leading-tight lg:text-7xl">
                                <span className="text-gray-900">Doc. Saclolo</span>
                                <br />
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                                    Dental Care
                                </span>
                                <br />
                                <span className="text-gray-900">System</span>
                            </h1>

                            <p className="max-w-2xl text-xl leading-relaxed text-gray-600 lg:text-2xl">
                                Transform your dental practice with comprehensive patient monitoring, seamless appointment management, and real-time
                                analytics that drive better patient outcomes.
                            </p>
                        </div>

                        {/* Enhanced Key Benefits */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {[
                                { icon: Clock, title: "Real-time", subtitle: "Live monitoring", color: "from-blue-500 to-blue-600" },
                                { icon: BarChart3, title: "Analytics", subtitle: "Smart insights", color: "from-purple-500 to-purple-600" },
                            ].map((benefit, index) => (
                                <div
                                    key={index}
                                    className="group cursor-pointer"
                                >
                                    <div className="flex transform items-center gap-4 rounded-xl border border-white/20 bg-white/70 p-4 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                                        <div
                                            className={`h-12 w-12 bg-gradient-to-r ${benefit.color} flex items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110`}
                                        >
                                            <benefit.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-900">{benefit.title}</p>
                                            <p className="text-gray-600">{benefit.subtitle}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Enhanced CTA Buttons */}
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <button
                                // 2. Idagdag ang onClick handler para lumabas ang modal
                                onClick={() => setShowLogin(true)}
                                className="group relative transform overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <div className="relative flex items-center justify-center gap-3">
                                    <span>Login</span>
                                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Enhanced Hero Image Section */}
                    <div className="relative">
                        {/* Main Image Container */}
                        <div className="relative">
                            {/* Main Image Container */}
                            <div className="group relative">
                                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 opacity-30 blur-xl transition-opacity duration-300 group-hover:opacity-50"></div>
                                <div className="relative overflow-hidden rounded-3xl bg-white p-2 shadow-2xl">
                                    <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-gray-100">
                                        <img
                                            src={dashboardImage}
                                            alt="Dashboard Preview"
                                            className="h-full w-full rounded-2xl object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Floating Cards */}
                        <div className="absolute -bottom-8 -left-8 animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600">
                                    <CheckCircle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-3xl font-black text-transparent">
                                        98%
                                    </p>
                                    <p className="font-medium text-gray-600">Patient Satisfaction</p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute -right-8 -top-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute h-4 w-4 animate-ping rounded-full bg-gradient-to-r from-green-400 to-emerald-500"></div>
                                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"></div>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Live Monitoring</p>
                                    <p className="text-sm text-gray-600">12 patients active</p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Floating Element */}
                        <div className="absolute -right-6 top-1/2 -translate-y-1/2 transform rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white shadow-xl">
                            <div className="text-center">
                                <p className="text-2xl font-bold">RealTime</p>
                                <p className="text-xs opacity-90">Realtime Notification</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* 3. Ilipat ang AuthFormModal sa loob ng return statement ng component */}
                <AuthFormModal
                    isOpen={showLogin}
                    onClose={() => setShowLogin(false)}
                />
            </div>
        </section>
    );
};

export default Hero;