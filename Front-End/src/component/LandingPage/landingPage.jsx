import { motion } from "framer-motion";
import Header from "./Header";
import Hero from "./Hero";
import Features from "./Features";
import Benefits from "./Benefits";
import Testimonials from "./Testimonial";
import CTA from "./CTA";
import Footer from "./Footer";
import Calendarandlayout from "./Calendarandlayout";

const LandingPage = () => {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Calendarandlayout />

        {/* Map Section with Scroll Effect */}
        <motion.div
          className="my-10 flex justify-center px-4"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="h-96 w-full max-w-7xl overflow-hidden rounded-lg shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.847997918439!2d124.3944012108966!3d11.562752388590503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a78cc8059249db%3A0xb537f9c43aa9f738!2sNAPOLES%20DENTAL%20CLINIC!5e0!3m2!1sen!2sph!4v1757777104637!5m2!1sen!2sph"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
