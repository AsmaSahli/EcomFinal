import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import { FaArrowRight, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { BsHeadphones } from 'react-icons/bs';
import { RiGamepadLine } from 'react-icons/ri';
import { GiSmartphone } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import { EffectCreative } from 'swiper/modules';
import laptopVideo from '../assets/mixkit-hands-of-a-girl-working-on-a-computer-4938-4k.mp4';
import audio from '../assets/mixkit-woman-takes-her-headphones-to-listen-to-music-51134-full-hd.mp4';
import smartphone from '../assets/mixkit-black-phone-on-laptop-247-hd-ready.mp4';
import FeaturedProducts from '../components/FeaturedProducts';

export const Home = () => {
  const navigate = useNavigate();
  const videoRefs = useRef([]);

  const mainPromotions = [
    {
      id: 1,
      title: "Next-Gen Smartphones",
      subtitle: "Experience lightning-fast 5G performance",
      video: smartphone,
      buttonText: "Explore",
      badgeText: "NEW ARRIVALS",
      bgGradient: "from-indigo-900 to-purple-900",
      category: "Phones & Smartwatches",
      group: "Smartphones"
    },
    {
      id: 2,
      title: "Premium Laptops",
      subtitle: "Ultra-thin designs with powerhouse performance",
      video: laptopVideo,
      buttonText: "Shop Now",
      badgeText: "LIMITED STOCK",
      bgGradient: "from-rose-900 to-amber-900",
      category: "Computers & IT",
      group: "Laptops"
    },
    {
      id: 3,
      title: "Immersive Audio",
      subtitle: "Studio-quality sound for audiophiles",
      video: audio,
      buttonText: "Browse",
      badgeText: "BESTSELLERS",
      bgGradient: "from-emerald-900 to-teal-900",
      category: "Photo & Audio",
      group: "Audio"
    }
  ];

  const squarePromotions = [
    {
      id: 1,
      title: "Gaming Special",
      subtitle: "High-performance gear",
      image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=878&q=80",
      buttonText: "View Deals",
      bgColor: "bg-gradient-to-br from-purple-600 to-indigo-800",
      icon: <RiGamepadLine className="text-4xl text-white" />,
      category: "Gaming"
    },
    {
      id: 2,
      title: "Audio Week",
      subtitle: "Premium sound systems",
      image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
      buttonText: "Browse",
      bgColor: "bg-gradient-to-br from-red-500 to-amber-600",
      icon: <BsHeadphones className="text-4xl text-white" />,
      category: "Photo & Audio",
      group: "Audio"
    },
    {
      id: 3,
      title: "Mobile Madness",
      subtitle: "Latest smartphones",
      image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=967&q=80",
      buttonText: "Browse",
      bgColor: "bg-gradient-to-br from-blue-500 to-cyan-600",
      icon: <GiSmartphone className="text-4xl text-white" />,
      category: "Phones & Smartwatches",
      group: "Smartphones"
    }
  ];

  const handlePromotionClick = (category, group = null) => {
    const params = new URLSearchParams();
    params.append('category', category);
    if (group) params.append('group', group);
    navigate(`/products?${params.toString()}`);
  };

  return (
    <div className="bg-gray-50">
      {/* Ultra-Creative Carousel Design */}
      <section className="relative overflow-hidden mx-auto my-8">
        <Swiper
          slidesPerView={1}
          loop={true}
          effect="creative"
          creativeEffect={{
            prev: {
              shadow: true,
              translate: ["-20%", 0, -400],
              opacity: 0
            },
            next: {
              shadow: true,
              translate: ["20%", 0, -400],
              opacity: 0
            }
          }}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet !bg-white/30 !h-1.5 !w-8 !rounded-full',
            bulletActiveClass: '!w-12 !bg-gradient-to-r from-cyan-400 to-blue-500'
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          autoplay={{ delay: 8000, pauseOnMouseEnter: true }}
          modules={[EffectCreative, Pagination, Navigation, Autoplay]}
          className="h-[400px]"
        >
          {mainPromotions.map((promo, index) => (
            <SwiperSlide
              key={promo.id}
              className="relative cursor-pointer"
              onClick={() => handlePromotionClick(promo.category, promo.group)}
            >
              <div className="absolute inset-0 overflow-hidden">
                <video
                  ref={el => videoRefs.current[index] = el}
                  src={promo.video}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-b ${promo.bgGradient} opacity-80`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              </div>
              <div className="relative h-full flex flex-col justify-end pb-24 px-8 md:px-16 lg:px-24 z-10">
                <div className="max-w-4xl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-block mb-6 px-4 py-2 bg-white text-gray-900 text-sm font-bold rounded-full shadow-lg"
                  >
                    {promo.badgeText}
                  </motion.div>
                  <motion.h2
                    className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    {promo.title}
                  </motion.h2>
                  <motion.p
                    className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    {promo.subtitle}
                  </motion.p>
                  <motion.div
                    className="flex flex-wrap gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <button className="px-8 py-4 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center shadow-lg">
                      {promo.buttonText} <FaArrowRight className="ml-3" />
                    </button>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="swiper-button-next !text-white !w-16 !h-16 !right-8 after:!text-2xl after:!font-thin hover:!bg-white/10 !transition-all !duration-300 !rounded-full !backdrop-blur-lg !border !border-white/20"></div>
          <div className="swiper-button-prev !text-white !w-16 !h-16 !left-8 after:!text-2xl after:!font-thin hover:!bg-white/10 !transition-all !duration-300 !rounded-full !backdrop-blur-lg !border !border-white/20"></div>
        </Swiper>
      </section>

      {/* Square Promotional Banners */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {squarePromotions.map((promo) => (
            <motion.div
              key={promo.id}
              className={`relative h-96 rounded-2xl overflow-hidden shadow-xl ${promo.bgColor}`}
              whileHover={{ scale: 1.02 }}
              onClick={() => handlePromotionClick(promo.category, promo.group)}
            >
              <img
                src={promo.image}
                alt={promo.title}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-70"
              />
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    {promo.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{promo.title}</h3>
                  <p className="text-white/90">{promo.subtitle}</p>
                </div>
                <button className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 w-fit">
                  {promo.buttonText}
                </button>
              </div>
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/10"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products and Flash Sale */}
      <FeaturedProducts />


      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Electsy</h3>
              <p className="text-gray-400 mb-4">Your one-stop shop for all the latest electronics and gadgets.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaFacebook className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaTwitter className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaInstagram className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaLinkedin className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaYoutube className="text-xl" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Shop</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Laptops</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Smartphones</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tablets</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Accessories</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Gaming</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shipping Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Returns & Refunds</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Track Order</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">About Us</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Our Story</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© 2025 Electsy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};