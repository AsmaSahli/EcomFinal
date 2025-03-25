import React from 'react';
// Import Swiper styles and components
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { motion } from "framer-motion";
import samsungLogo from "../assets/samsungLogo.png";
import lenovo from "../assets/lenovo.png";
import xiaomi from "../assets/xiaomi.png";
import intel from "../assets/intel.png";
import nvidia from "../assets/nvidia.png";
import amd from "../assets/amd.png";
import playstation from "../assets/playstation.png";
import lg from "../assets/lg.png";
import asus from "../assets/asus.png";
import jbl from "../assets/jbl.png";


export const Home = () => {
  // Dummy data for featured products
  const featuredProducts = [
    {
      id: 1,
      image: 'https://placehold.co/300x200',
      title: 'Product 1',
      description: 'Amazing product description here.',
    },
    {
      id: 2,
      image: 'https://placehold.co/300x200',
      title: 'Product 2',
      description: 'Amazing product description here.',
    },
    {
      id: 3,
      image: 'https://placehold.co/300x200',
      title: 'Product 3',
      description: 'Amazing product description here.',
    },
    {
      id: 4,
      image: 'https://placehold.co/300x200',
      title: 'Product 4',
      description: 'Amazing product description here.',
    },
    {
      id: 5,
      image: 'https://placehold.co/300x200',
      title: 'Product 5',
      description: 'Amazing product description here.',
    },
    {
      id: 6,
      image: 'https://placehold.co/300x200',
      title: 'Product 6',
      description: 'Amazing product description here.',
    },
  ];
  const brands = [
    { id: 1, logo: samsungLogo, name: 'Brand 1' },
    { id: 2, logo: lenovo, name: 'Brand 2' },
    { id: 3, logo: xiaomi, name: 'Brand 3' },
    { id: 4, logo: intel, name: 'Brand 4' },
    { id: 5, logo: nvidia, name: 'Brand 5' },
    { id: 6, logo: amd, name: 'Brand 6' },
    { id: 7, logo: playstation, name: 'Brand 7' },
    { id: 8, logo: lg, name: 'Brand 8' },
    { id: 9, logo: asus, name: 'Brand 9' },
    { id: 10, logo: jbl, name: 'Brand 10' },
    { id: 11, logo: samsungLogo, name: 'Brand 1' },
    { id: 12, logo: lenovo, name: 'Brand 2' },
    { id: 13, logo: xiaomi, name: 'Brand 3' },
    { id: 14, logo: intel, name: 'Brand 4' },
    { id: 15, logo: nvidia, name: 'Brand 5' },
    { id: 16, logo: amd, name: 'Brand 6' },
    { id: 17, logo: playstation, name: 'Brand 7' },
    { id: 18, logo: lg, name: 'Brand 8' },
    { id: 19, logo: asus, name: 'Brand 9' },
    { id: 20, logo: jbl, name: 'Brand 10' },

  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center min-h-[60vh] px-6 md:px-12 lg:px-24 bg-[#020617] overflow-hidden">
      
      {/* Glow Background Lights */}
      <motion.div 
        className="absolute top-[-50px] left-[-100px] w-[300px] h-[300px] bg-blue-500/30 blur-[100px]" 
        animate={{ x: [0, 50, -50, 0], y: [0, 20, -20, 0] }} 
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }} 
      />
      <motion.div 
        className="absolute bottom-[-50px] right-[-100px] w-[300px] h-[300px] bg-purple-500/30 blur-[100px]" 
        animate={{ x: [0, -50, 50, 0], y: [0, -20, 20, 0] }} 
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }} 
      />

      {/* Hero Content */}
      <motion.div 
        className="relative z-10 max-w-3xl text-white backdrop-blur-md bg-white/5 p-6 md:p-8 rounded-2xl shadow-lg border border-white/10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1 
          className="text-4xl md:text-5xl font-extrabold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        >
          Upgrade Your Tech Experience
        </motion.h1>

        <motion.p 
          className="text-md md:text-lg text-gray-300 mt-2 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          Premium electronics at the best prices. Fast delivery, secure payments.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          className="mt-6 flex justify-center space-x-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
        >
          <motion.button
            className="relative px-6 py-2 md:px-8 md:py-3 text-sm md:text-lg font-semibold rounded-full text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop Now
          </motion.button>
          
          <motion.button
            className="relative px-6 py-2 md:px-8 md:py-3 text-sm md:text-lg font-semibold rounded-full text-white border border-gray-300/50 hover:bg-gray-300/10 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Brand Slider */}
      <div className="relative z-10 w-full mt-12 overflow-hidden">
        <Swiper
          slidesPerView={5}
          spaceBetween={10} 
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          speed={3000}
          loop={true}
          modules={[Autoplay]}
          className="mySwiper"
        >
          {brands.map((brand) => (
            <SwiperSlide key={brand.id}>
              <div className="flex justify-center items-center h-16"> {/* Reduced height from h-20 to h-16 */}
                <img src={brand.logo} alt={brand.name} className="max-h-12 max-w-full" /> {/* Reduced logo size */}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>


      {/* Reasons to Shop Section */}
      <section className="py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Even more reasons to shop with us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card bg-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="card-body items-center text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold">Fast Delivery</h3>
              <p className="text-gray-600">Get your items quickly and reliably.</p>
            </div>
          </div>
          <div className="card bg-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="card-body items-center text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold">Secure Payments</h3>
              <p className="text-gray-600">Shop with confidence using secure payment methods.</p>
            </div>
          </div>
          <div className="card bg-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="card-body items-center text-center">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-xl font-bold">24/7 Support</h3>
              <p className="text-gray-600">Our support team is always here to help.</p>
            </div>
          </div>
          <div className="card bg-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="card-body items-center text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold">Easy Returns</h3>
              <p className="text-gray-600">Hassle-free returns within 30 days.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section with Swiper Carousel */}
      <section className="py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Featured Products</h2>
        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          modules={[Pagination, Navigation, Autoplay]}
          className="mySwiper"
        >
          {featuredProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="card bg-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <figure className="px-6 pt-6">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="rounded-xl h-48 w-full object-cover"
                  />
                </figure>
                <div className="card-body items-center text-center">
                  <h3 className="card-title text-xl font-bold">{product.title}</h3>
                  <p className="text-gray-600">{product.description}</p>
                  <div className="card-actions mt-4">
                    <button className="btn btn-primary">Buy Now</button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </div>
  );
};