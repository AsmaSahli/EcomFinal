
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';
import { IoMdFlash } from 'react-icons/io';
import ProductCard from './ProductCard';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const FeaturedProducts = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/products?featured=true`);
        const productsWithOffers = Array.isArray(response.data.products) ? response.data.products : response.data;
        setFeaturedProducts(productsWithOffers);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError(t('featuredProducts.error.load'));
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(`${API_URL}/wishlist?userId=${currentUser.id}`);
          dispatch({
            type: 'wishlist/setWishlist',
            payload: response.data.items.map(item => ({
              ...item,
              price: item.price || item.productId?.price || 0,
              stock: item.stock || item.productId?.stock || 0,
              productId: {
                ...item.productId,
                reviews: item.productId.reviews || [],
                promotions: item.productId.promotions || []
              }
            }))
          });
        } catch (err) {
          toast.error(t('featuredProducts.error.wishlist'));
        }
      }
    };

    fetchFeaturedProducts();
    fetchWishlist();
  }, [currentUser, dispatch, t]);

  const chunkArray = (arr, size) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  // Filter products with active promotions for Flash Sale
  const flashSaleProducts = featuredProducts
    .flatMap(product =>
      product.sellers
        .filter(sellerOffer => sellerOffer.activePromotion)
        .map(sellerOffer => ({ product, sellerOffer }))
    );

  const flashSaleGroups = chunkArray(flashSaleProducts, 5); // Group by 5 for 5-column grid
  const featuredProductGroups = chunkArray(
    featuredProducts.flatMap(product =>
      product.sellers.map(sellerOffer => ({ product, sellerOffer }))
    ),
    4
  );

  return (
    <>
      {/* Flash Sale Section */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-pink-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl animate-float"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="relative">
                <IoMdFlash className="text-4xl text-white mr-4 animate-pulse" />
                <div className="absolute -inset-2 bg-white/20 rounded-full animate-ping"></div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{t('featuredProducts.flashSale.title')}</h2>
                <p className="text-white/90">{t('featuredProducts.flashSale.subtitle')}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : flashSaleProducts.length > 0 ? (
            <Swiper
              slidesPerView={1}
              spaceBetween={24}
              loop={true}
              pagination={{ clickable: true }}
              navigation={true}
              modules={[Pagination, Navigation]}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 1 },
                1024: { slidesPerView: 1 },
              }}
              className="mySwiper"
            >
              {flashSaleGroups.map((group, index) => (
                <SwiperSlide key={index}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {group.map(({ product, sellerOffer }) => (
                      <ProductCard
                        key={`${product._id}-${sellerOffer.sellerId._id}`}
                        product={product}
                        sellerOffer={sellerOffer}
                      />
                    ))}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-center py-8 text-white/90">
              {t('featuredProducts.flashSale.empty')}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{t('featuredProducts.featured.title')}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('featuredProducts.featured.subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : featuredProductGroups.length > 0 ? (
          <Swiper
            slidesPerView={1}
            spaceBetween={30}
            loop={true}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[Pagination, Navigation]}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 1 },
              1024: { slidesPerView: 1 },
            }}
            className="mySwiper"
          >
            {featuredProductGroups.map((group, index) => (
              <SwiperSlide key={index}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {group.map(({ product, sellerOffer }) => (
                    <ProductCard
                      key={`${product._id}-${sellerOffer.sellerId._id}`}
                      product={product}
                      sellerOffer={sellerOffer}
                    />
                  ))}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t('featuredProducts.featured.empty')}
          </div>
        )}
      </section>
    </>
  );
};

export default FeaturedProducts;
