import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FaStar, FaRegStar, FaShoppingCart, FaHome, FaCheck, FaFireAlt
} from 'react-icons/fa';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import {
  RiTruckLine, RiShieldCheckLine, RiExchangeLine, RiLeafLine
} from 'react-icons/ri';
import { BsShieldCheck, BsBoxSeam, BsCheckCircleFill } from 'react-icons/bs';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { addItem as addWishlistItem, removeItem as removeWishlistItem } from '../redux/user/wishlistSlice';
import { addItem as addCartItem } from '../redux/user/cartSlice';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductReviews from '../components/ProductReviews';
import BreadcrumbNav from '../components/BreadcrumbNav';
import SimilarProducts from '../components/SimilarProducts';
import { useTranslation } from 'react-i18next';

const ProductDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const wishlistItems = useSelector((state) => state.wishlist.items || []);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(location.state?.openReviews ? 'reviews' : 'description');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const reviewsRef = useRef(null);

  const API_URL = 'http://localhost:8000/api';
  const queryParams = new URLSearchParams(location.search);
  const sellerId = queryParams.get('seller');
  const currentSeller = product?.sellers?.find(s => s.sellerId._id === sellerId) || product?.sellers?.[0];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const url = sellerId ? `${API_URL}/products/${id}?seller=${sellerId}` : `${API_URL}/products/${id}`;
        const response = await axios.get(url);
        setProduct(response.data.product);
        if (response.data.product.variants?.length > 0) {
          setSelectedVariant(response.data.product.variants[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || t('product.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, sellerId, t]);

  useEffect(() => {
    if (product && currentSeller?.sellerId._id) {
      const fetchReviews = async () => {
        try {
          const response = await axios.get(`${API_URL}/reviews/${product._id}/${currentSeller.sellerId._id}`);
          const reviews = response.data;
          const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1)
            : 0;
          setAverageRating(parseFloat(avgRating));
          setReviewCount(reviews.length);
        } catch (err) {
          console.error(t('product.reviewError'), err);
          setAverageRating(0);
          setReviewCount(0);
        }
      };
      fetchReviews();
    }
  }, [product, currentSeller, t]);

  useEffect(() => {
    if (product && currentUser) {
      const wishlisted = wishlistItems.some(
        item =>
          item.productId?._id === product._id &&
          (item.sellerId?._id === currentSeller?.sellerId._id || (!item.sellerId && !currentSeller?.sellerId))
      );
      setIsWishlisted(wishlisted);
    }
  }, [product, wishlistItems, currentUser, currentSeller]);

  useEffect(() => {
    if (location.state?.openReviews && reviewsRef.current && !loading) {
      // Scroll to reviews section smoothly
      reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.state, loading]);

  const getKeyFeatures = () => {
    if (!product?.description) return [];
    return product.description.split('\r\n')
      .filter(line => line.trim() && !line.toLowerCase().includes('points forts'))
      .slice(0, 5);
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.error(t('product.mustLogin'));
      return;
    }

    if (!currentSeller?.stock || currentSeller.stock < quantity) {
      toast.error(t('product.outOfStock'));
      return;
    }

    try {
      const priceToUse = currentSeller.hasActivePromotion
        ? currentSeller.promotions.find(p => p.promotionId._id === currentSeller.activePromotion._id)?.newPrice
        : currentSeller.price;

      const response = await axios.post(`${API_URL}/cart/add`, {
        userId: currentUser.id,
        productId: product._id,
        sellerId: currentSeller?.sellerId._id,
        quantity,
        price: priceToUse,
        variantId: selectedVariant?._id,
      });

      const newItem = response.data.cart.items[response.data.cart.items.length - 1];
      dispatch(addCartItem({
        ...newItem,
        productId: {
          ...product,
          price: priceToUse,
          stock: currentSeller?.stock || product.stock,
        },
        sellerId: currentSeller?.sellerId,
        price: priceToUse,
        stock: currentSeller?.stock || product.stock,
        variantId: selectedVariant?._id,
      }));

      toast.success(t('product.addedToCart'), {
        position: "bottom-right",
        className: "!bg-green-50 !text-green-700",
        icon: <BsCheckCircleFill className="text-green-500" />,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || t('product.cartError'));
    }
  };

  const toggleWishlist = async () => {
    if (!currentUser) {
      toast.error(t('product.mustLoginWishlist'));
      return;
    }

    if (isTogglingWishlist) return;

    setIsTogglingWishlist(true);
    try {
      const priceToUse = currentSeller.hasActivePromotion
        ? currentSeller.promotions.find(p => p.promotionId._id === currentSeller.activePromotion._id)?.newPrice
        : currentSeller.price;

      if (isWishlisted) {
        const item = wishlistItems.find(
          item =>
            item.productId?._id === product._id &&
            (item.sellerId?._id === currentSeller?.sellerId._id || (!item.sellerId && !currentSeller?.sellerId))
        );
        if (item) {
          await axios.delete(`${API_URL}/wishlist/item`, {
            data: { userId: currentUser.id, itemId: item._id },
          });
          dispatch(removeWishlistItem(item._id));
          toast.success(t('product.removedFromWishlist'), {
            position: "bottom-right",
            className: "!bg-red-50 !text-red-700",
            icon: <IoMdHeartEmpty className="text-red-500" />,
          });
        }
      } else {
        const response = await axios.post(`${API_URL}/wishlist/add`, {
          userId: currentUser.id,
          productId: product._id,
          sellerId: currentSeller?.sellerId._id,
          price: priceToUse,
          stock: currentSeller?.stock || product.stock || 0,
          variantId: selectedVariant?._id,
        });

        const newItem = response.data.wishlist.items.find(
          item =>
            item.productId?._id === product._id &&
            (item.sellerId?._id === currentSeller?.sellerId._id || (!item.sellerId && !currentSeller?.sellerId))
        );

        if (newItem) {
          dispatch(addWishlistItem({
            ...newItem,
            productId: product,
            sellerId: currentSeller?.sellerId,
            price: priceToUse,
            stock: currentSeller?.stock || product.stock || 0,
            variantId: selectedVariant?._id,
          }));
          toast.success(t('product.addedToWishlist'), {
            position: "bottom-right",
            className: "!bg-pink-50 !text-pink-700",
            icon: <IoMdHeart className="text-pink-500" />,
          });
        }
      }
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      toast.error(err.response?.data?.message || t('product.wishlistError'));
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      i < Math.floor(rating) ?
        <FaStar key={i} className="text-yellow-400" /> :
        <FaRegStar key={i} className="text-gray-300" />
    ));
  };

  if (loading) return (
    <div className="bg-white py-3 px-6 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center text-sm text-gray-600">
          <span className="text-gray-500">{t('product.loading')}</span>
        </nav>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm max-w-md text-center">
        <div className="text-red-400 text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('product.notFound')}</h2>
        <p className="text-gray-500 mb-5">{error}</p>
        <div className="flex space-x-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            {t('product.goBack')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            {t('product.home')}
          </button>
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const keyFeatures = getKeyFeatures();
  const hasDiscount = currentSeller?.hasActivePromotion;
  const activePromotion = currentSeller?.activePromotion;
  const promotionDetails = hasDiscount
    ? currentSeller.promotions.find(p => p.promotionId._id === activePromotion._id)
    : null;
  const currentPrice = hasDiscount ? promotionDetails?.newPrice?.toFixed(2) : currentSeller?.price?.toFixed(2);
  const originalPrice = hasDiscount ? promotionDetails?.oldPrice?.toFixed(2) : null;
  const discountRate = hasDiscount ? activePromotion.discountRate : 0;
  const promotionName = hasDiscount ? activePromotion.name || t('product.specialOffer') : '';
  const promotionEndDate = hasDiscount
    ? new Date(activePromotion.endDate).toLocaleDateString(navigator.language, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const promotionImage = hasDiscount ? activePromotion.image?.url : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNav product={product} />

        <div className="bg-white rounded-xl shadow-sm overflow-hidden relative">
          {hasDiscount && (
            <div 
              className="absolute top-4 left-4 z-10 transform -rotate-6 hover:rotate-0 transition-transform duration-300 cursor-pointer"
              onClick={() => setShowPromotionModal(true)}
            >
              <div className="relative group">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg shadow-md flex items-stretch overflow-hidden min-w-[120px]">
                  {promotionImage ? (
                    <div className="flex">
                      <div className="w-10 h-10 p-1 flex items-center justify-center bg-white/20 border-r border-orange-400">
                        <img
                          src={promotionImage}
                          alt={promotionName}
                          className="w-full h-full object-cover rounded border border-white"
                        />
                      </div>
                      <div className="px-2 py-1 flex flex-col justify-center">
                        <span className="font-bold text-xs block leading-tight max-w-[80px] truncate">
                          {promotionName}
                        </span>
                        <span className="text-[10px] font-bold bg-white text-red-600 px-1 py-0.5 rounded-full mt-1 w-fit">
                          {discountRate}% {t('product.off')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex">
                      <div className="w-10 h-10 p-1.5 flex items-center justify-center bg-white/20 border-r border-orange-400">
                        <div className="w-full h-full rounded bg-orange-400/30 border border-dashed border-white flex items-center justify-center">
                          <FaFireAlt className="text-white text-sm" />
                        </div>
                      </div>
                      <div className="px-2 py-1 flex flex-col justify-center">
                        <span className="font-bold text-xs block leading-tight">
                          {promotionName}
                        </span>
                        <span className="text-[10px] font-bold bg-white text-red-600 px-1 py-0.5 rounded-full mt-1 w-fit">
                          {discountRate}% {t('product.off')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute -top-1 left-2 w-5 h-2 bg-red-700/80 transform rotate-45 origin-bottom-left rounded-sm"></div>
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-lg"></div>
                <div className="absolute z-20 left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg min-w-[150px]">
                  <div className="absolute -top-1 left-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                  <div className="flex items-start space-x-2">
                    {promotionImage && (
                      <img
                        src={promotionImage}
                        alt={promotionName}
                        className="w-8 h-8 rounded border border-white object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold text-sm">{promotionName}</p>
                      <p className="text-orange-300 font-medium text-xs">
                        {discountRate}% {t('product.discount')}
                      </p>
                      <p className="text-[10px] text-gray-300 mt-0.5">
                        {t('product.ends')} {promotionEndDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="md:flex">
            <ProductImageGallery
              images={product.images || []}
              productName={product.name}
              currentSeller={currentSeller}
              hasDiscount={hasDiscount}
              promotionImage={promotionImage}
              promotionName={promotionName}
              discountRate={discountRate}
            />

            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full mb-2">
                    {product.categoryDetails?.category?.name}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">{product.shortDescription}</p>
                </div>
                <button
                  onClick={toggleWishlist}
                  disabled={isTogglingWishlist}
                  className={`p-2 rounded-full transition-colors ${
                    isWishlisted ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                  } ${isTogglingWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isTogglingWishlist ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : isWishlisted ? (
                    <IoMdHeart size={24} />
                  ) : (
                    <IoMdHeartEmpty size={24} />
                  )}
                </button>
              </div>

              <div className="flex items-center mb-5">
                <div className="flex mr-2">
                  {renderStars(averageRating)}
                </div>
                <span className="text-sm text-gray-500">
                  {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? t('product.review') : t('product.reviews')}) •{' '}
                  <span className="text-green-600">{currentSeller?.stock > 0 ? t('product.inStock') : t('product.outOfStock')}</span>
                </span>
              </div>

              {product.variants?.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{t('product.selectOption')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                          selectedVariant?._id === variant._id
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-gray-900">
                    ${currentPrice}
                  </span>
                  {hasDiscount && (
                    <div className="ml-3">
                      <span className="text-sm text-gray-500 line-through">
                        ${originalPrice}
                      </span>
                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {t('product.save')} ${(originalPrice - currentPrice).toFixed(2)} ({discountRate}% {t('product.off')})
                      </span>
                    </div>
                  )}
                </div>
                {hasDiscount && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">{promotionName}</span> • {t('product.ends')} {promotionEndDate}
                  </div>
                )}
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <RiLeafLine className="text-green-500 mr-1" />
                  {t('product.ecoFriendly')}
                </div>
              </div>

              {keyFeatures.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-lg text-gray-900 mb-3">{t('product.keyFeatures')}</h3>
                  <ul className="space-y-3">
                    {keyFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <FaCheck className="text-purple-500 mt-0.5 mr-2 flex-shrink-0 text-sm" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentSeller?.sellerId && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium mr-3">
                      {currentSeller.sellerId.shopName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <Link
                        to={`/sellers/${currentSeller.sellerId._id}/products`}
                        className="font-medium text-gray-900 hover:text-purple-600"
                      >
                        {currentSeller.sellerId.shopName || t('product.unknownSeller')}
                      </Link>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <div className="flex items-center mr-3">
                          {renderStars(currentSeller.sellerId.rating || 4.8)}
                          <span className="ml-1">{currentSeller.sellerId.rating?.toFixed(1) || '4.8'}</span>
                        </div>
                        <span>•</span>
                        <span className="ml-2">
                          {currentSeller.sellerId.positiveFeedbackPercentage?.toFixed(0) || '90'}% {t('product.positive')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-gray-600 p-2 bg-white rounded-lg border border-gray-200">
                      <RiTruckLine className="text-purple-500 mr-2" />
                      {t('product.freeShipping')}
                    </div>
                    <div className="flex items-center text-gray-600 p-2 bg-white rounded-lg border border-gray-200">
                      <RiShieldCheckLine className="text-purple-500 mr-2" />
                      {t('product.warranty')}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <span className="mr-3 font-medium">{t('product.quantity')}:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300 font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(currentSeller?.stock || 10, q + 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
                    disabled={currentSeller?.stock <= 0}
                  >
                    <FaShoppingCart className="mr-3" />
                    {currentSeller?.stock > 0 ? t('product.addToCart') : t('product.soldOut')}
                  </button>
                  <button
                    className="w-full py-3 px-4 bg-white border border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                    disabled={currentSeller?.stock <= 0}
                  >
                    {t('product.buyNow')}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 border-t border-gray-200 pt-4">
                <div className="flex items-center">
                  <BsShieldCheck className="text-green-500 mr-1" />
                  {t('product.securePayment')}
                </div>
                <div className="flex items-center">
                  <BsBoxSeam className="text-blue-500 mr-1" />
                  {t('product.freeReturns')}
                </div>
                <div className="flex items-center">
                  <RiExchangeLine className="text-purple-500 mr-1" />
                  {t('product.returnsPolicy')}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200" ref={reviewsRef}>
            <div className="flex border-b border-gray-200 overflow-x-auto">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {t(`product.tabs.${tab}`)}
                </button>
              ))}
            </div>
            <div className="p-6 md:p-8">
              {activeTab === 'description' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('product.description')}</h3>
                  <div className="text-gray-700 space-y-4">
                    {product.description.split('\n\n').map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">{t('product.general')}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{t('product.brand')}</span>
                        <span className="font-medium">BrandName</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{t('product.model')}</span>
                        <span className="font-medium">{product.reference}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">{t('product.technical')}</h4>
                    <div className="space-y-3">
                      {product.tags?.slice(0, 4).map((tag, i) => (
                        <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">{tag.name}</span>
                          <span className="font-medium text-purple-600">Yes</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'reviews' && (
                <ProductReviews
                  productId={product._id}
                  sellerId={currentSeller?.sellerId._id}
                />
              )}
            </div>
          </div>

          <SimilarProducts productId={id} sellerId={sellerId} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;