import { ArrowRight, CheckCircle, Phone, Mail } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Main CTA Card */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-12 lg:p-16 text-center space-y-8">
          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
              Ready to Transform Your Dental Practice?
            </h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed text-white/90">
              Join hundreds of dental professionals who've revolutionized their 
              patient care with our comprehensive monitoring system.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto relative z-10">
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button className="group px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/95 flex items-center justify-center gap-2 transition">
              Start Free Trial Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 hover:text-white transition">
              Schedule a Demo
            </button>
          </div>

          {/* Trust indicator */}
          <p className="text-white/80 text-sm relative z-10">
            ⭐⭐⭐⭐⭐ Rated 4.9/5 by 500+ dental professionals
          </p>

          {/* Background overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-500 opacity-50 rounded-2xl"></div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {/* Sales Contact */}
          <div className="p-8 rounded-2xl bg-white shadow-md text-center space-y-6 dark:bg-gray-800">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Talk to Sales</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get a personalized demo and discuss pricing options with our dental technology experts.
              </p>
            </div>
            <button className="w-full px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition">
              Call (555) 123-4567
            </button>
          </div>

          {/* Support Contact */}
          <div className="p-8 rounded-2xl bg-white shadow-md text-center space-y-6 dark:bg-gray-800">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-accent" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Get Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Have questions? Our technical support team is available 24/7 to help you get started.
              </p>
            </div>
            <button className="w-full px-4 py-2 border border-accent text-accent rounded-lg hover:bg-accent/10 transition">
              Email Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
