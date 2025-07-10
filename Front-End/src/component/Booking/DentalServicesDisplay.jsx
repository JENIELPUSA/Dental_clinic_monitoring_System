import React, { useContext } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { DoctorDisplayContext } from '../../contexts/DoctorContext/doctorContext';

function DentalServicesDisplay() {
    const {doctor}=useContext(DoctorDisplayContext)
    const availableDoctors = [
    {
      id: 1,
      name: 'Dr. Maria Santos',
      specialty: 'General Dentistry',
      imageUrl: 'https://via.placeholder.com/200x200/4299E1/FFFFFF?text=Dr.Santos',
      description: 'Experienced in routine check-ups, cleanings, and minor dental procedures.',
      linkText: 'View Profile',
      linkUrl: '#profile-dr-santos'
    },
    {
      id: 2,
      name: 'Dr. Robert Lim',
      specialty: 'Orthodontics',
      imageUrl: 'https://via.placeholder.com/200x200/3182CE/FFFFFF?text=Dr.Lim',
      description: 'Specializes in braces, Invisalign, and other teeth alignment treatments.',
      linkText: 'Book Consultation',
      linkUrl: '#book-dr-lim'
    },
    {
      id: 3,
      name: 'Dr. Anna Garcia',
      specialty: 'Pediatric Dentistry',
      imageUrl: 'https://via.placeholder.com/200x200/48BB78/FFFFFF?text=Dr.Garcia',
      description: 'Passionate about children\'s dental health, providing gentle and fun care.',
      linkText: 'Learn More',
      linkUrl: '#profile-dr-garcia'
    },
    {
      id: 4,
      name: 'Dr. Michael Tan',
      specialty: 'Oral Surgery',
      imageUrl: 'https://via.placeholder.com/200x200/C05621/FFFFFF?text=Dr.Tan',
      description: 'Expert in tooth extractions, dental implants, and other surgical procedures.',
      linkText: 'View Profile',
      linkUrl: '#profile-dr-tan'
    },
    {
      id: 5,
      name: 'Dr. Sofia Reyes',
      specialty: 'Cosmetic Dentistry',
      imageUrl: 'https://via.placeholder.com/200x200/D53F8C/FFFFFF?text=Dr.Reyes',
      description: 'Dedicated to enhancing smiles through veneers, whitening, and aesthetic bonding.',
      linkText: 'Book Consultation',
      linkUrl: '#book-dr-reyes'
    },
    {
      id: 6,
      name: 'Dr. Leo Cruz',
      specialty: 'Periodontics',
      imageUrl: 'https://via.placeholder.com/200x200/718096/FFFFFF?text=Dr.Cruz',
      description: 'Focuses on the prevention, diagnosis, and treatment of gum disease.',
      linkText: 'View Profile',
      linkUrl: '#profile-dr-cruz'
    },
    {
      id: 7,
      name: 'Dr. Isabel Gomez',
      specialty: 'Endodontics',
      imageUrl: 'https://via.placeholder.com/200x200/667EEA/FFFFFF?text=Dr.Gomez',
      description: 'Specializing in root canal treatments and managing tooth pain.',
      linkText: 'Learn More',
      linkUrl: '#profile-dr-gomez'
    },
    {
      id: 8,
      name: 'Dr. David Kim',
      specialty: 'Prosthodontics',
      imageUrl: 'https://via.placeholder.com/200x200/ED8936/FFFFFF?text=Dr.Kim',
      description: 'Designs and fits prostheses to restore oral function and appearance.',
      linkText: 'Book Consultation',
      linkUrl: '#book-dr-kim'
    },
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex flex-col items-center py-3 px-4 sm:px-6 lg:px-8 rounded-lg">
      {/* Animated Banner Section */}
      <section className="w-full max-w-4xl mb-12">
        <div className="relative rounded-xl shadow-lg overflow-hidden h-64 flex items-center justify-center bg-blue-700">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Moving dental icons */}
            <div className="absolute top-10 left-10 text-white opacity-20 animate-float1">
              <ToothIcon />
            </div>
            <div className="absolute top-20 right-20 text-white opacity-15 animate-float2">
              <ToothIcon size={12} />
            </div>
            <div className="absolute bottom-20 left-1/4 text-white opacity-10 animate-float3">
              <ToothIcon size={20} />
            </div>
            
            {/* Pulse effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="absolute w-40 h-40 rounded-full border border-white opacity-10 animate-pulse1"></div>
              <div className="absolute w-60 h-60 rounded-full border border-white opacity-5 animate-pulse2"></div>
            </div>
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
          
          {/* Banner Content */}
          <div className="p-6 w-full text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Comprehensive Dental Care
            </h2>
            <p className="text-yellow-300 text-xl font-semibold mb-4">ALL-IN Whitening Promo!</p>
            <button className="bg-white text-blue-700 font-bold py-2 px-6 rounded-full shadow-md hover:bg-gray-100 transition duration-300">
              Book Now <span className="ml-1 text-xl">&gt;</span>
            </button>
          </div>
        </div>
      </section>

      {/* Doctors Slider Section - IMPORTANT: This must be included */}
      <section className="w-full max-w-4xl mb-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
          Available Doctor's Today
        </h2>
        
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation={true}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          loop={true}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          className="mySwiper p-4 pb-12"
        >
          {availableDoctors.map((doctor) => (
            <SwiperSlide key={doctor.id}>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 h-full flex flex-col">
                <img
                  src={doctor.imageUrl}
                  alt={doctor.name}
                  className="w-full h-48 object-cover object-top"
                />
                <div className="p-5 flex flex-col flex-grow text-center">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    {doctor.name}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
                    {doctor.specialty}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                    {doctor.description}
                  </p>
                  <a
                    href={doctor.linkUrl}
                    className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 mt-auto inline-block"
                  >
                    {doctor.linkText} →
                  </a>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(10px) rotate(-5deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(10deg); }
        }
        @keyframes pulse1 {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.1; }
          50% { transform: translate(-50%, -50%) scale(1); opacity: 0.05; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.1; }
        }
        @keyframes pulse2 {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.05; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.1; }
          100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.05; }
        }
        .animate-float1 { animation: float1 8s ease-in-out infinite; }
        .animate-float2 { animation: float2 6s ease-in-out infinite; }
        .animate-float3 { animation: float3 10s ease-in-out infinite; }
        .animate-pulse1 { animation: pulse1 4s ease-in-out infinite; }
        .animate-pulse2 { animation: pulse2 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// Tooth icon component
const ToothIcon = ({ size = 16 }) => (
  <svg 
    className={`w-${size} h-${size}`} 
    fill="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3.5-9c-.83 0-1.5-.67-1.5-1.5S7.67 8 8.5 8s1.5.67 1.5 1.5S9.33 11 8.5 11zm7 0c-.83 0-1.5-.67-1.5-1.5S14.67 8 15.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
  </svg>
);

export default DentalServicesDisplay;