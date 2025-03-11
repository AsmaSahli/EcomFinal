import React from 'react';
// Import Swiper styles and components
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-2xl mb-12">
        <h1 className="text-5xl font-bold mb-4">Shop our most popular categories</h1>
        <p className="text-xl mb-8">Even more reasons to shop with us</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
          <div className="card bg-white shadow-2xl hover:scale-105 transition-transform duration-300">
            <figure className="px-6 pt-6">
              <img
                src="https://placehold.co/300x200"
                alt="Elegant"
                className="rounded-xl"
              />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title text-2xl font-bold">Elegant</h2>
              <p className="text-gray-600">Empowering your Tech Experience</p>
              <div className="card-actions mt-4">
                <button className="btn btn-primary">Explore</button>
              </div>
            </div>
          </div>
          <div className="card bg-white shadow-2xl hover:scale-105 transition-transform duration-300">
            <figure className="px-6 pt-6">
              <img
                src="https://placehold.co/300x200"
                alt="Shop"
                className="rounded-xl"
              />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title text-2xl font-bold">Shop</h2>
              <p className="text-gray-600">Categories</p>
              <div className="card-actions mt-4">
                <button className="btn btn-primary">Explore</button>
              </div>
            </div>
          </div>
          <div className="card bg-white shadow-2xl hover:scale-105 transition-transform duration-300">
            <figure className="px-6 pt-6">
              <img
                src="https://placehold.co/300x200"
                alt="Sell"
                className="rounded-xl"
              />
            </figure>
            <div className="card-body items-center text-center">
              <h2 className="card-title text-2xl font-bold">Sell</h2>
              <p className="text-gray-600">Sell on Electsy</p>
              <div className="card-actions mt-4">
                <button className="btn btn-primary">Explore</button>
              </div>
            </div>
          </div>
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