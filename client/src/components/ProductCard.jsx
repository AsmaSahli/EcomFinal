import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaShoppingCart, FaFireAlt } from 'react-icons/fa';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import axios from 'axios';
import { addItem as addWishlistItem, removeItem as removeWishlistItem } from '../redux/user/wishlistSlice';
import { addItem as addCartItem } from '../redux/user/cartSlice';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import debounce from 'lodash.debounce';

const ProductCard = ({ product, sellerOffer }) => {
  const { currentUser } = useSelector((state) => state.user);
  const wishlistItems = useSelector((state) => state.wishlist.items || []);
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [activePromotion, setActivePromotion] = useState(null);

  const WISHLIST_API_URL = 'http://localhost:8000/api/wishlist';
  const CART_API_URL = 'http://localhost:8000/api/cart';
  const API_URL = 'http://localhost:8000/api';

  const isWishlisted = wishlistItems.some(
    (item) =>
      item.productId._id === product._id &&
      (item.sellerId?._id === sellerOffer?.sellerId?._id || (!item.sellerId && !sellerOffer?.sellerId))
  );

  const price = (sellerOffer?.price || product?.price || 0).toFixed(2);
  const stock = sellerOffer?.stock ?? product?.stock ?? 0;
  const status = stock > 0 ? 'In Stock' : 'Out of Stock';
  const sellerId = sellerOffer?.sellerId?._id || product?.sellerId?._id;
  const shopName = sellerOffer?.sellerId?.shopName || product?.sellerId?.shopName || 'Seller';

  // Promotion details
  useEffect(() => {
    if (sellerOffer?.activePromotion?._id) {
      const promotion = sellerOffer.promotions?.find(
        (promo) =>
          promo.isActive &&
          promo.promotionId?._id &&
          promo.promotionId._id.toString() === sellerOffer.activePromotion._id.toString()
      );
      setActivePromotion(promotion || sellerOffer.activePromotion);
    } else {
      setActivePromotion(null);
    }
  }, [sellerOffer]);

  const hasActivePromotion = !!activePromotion;
  const promotionName = hasActivePromotion ? activePromotion.promotionId?.name || activePromotion.name || 'HOT DEAL' : '';
  const discountRate = hasActivePromotion ? activePromotion.promotionId?.discountRate || activePromotion.discountRate || 0 : 0;
  const promotionImage = hasActivePromotion ? activePromotion.promotionId?.image?.url || activePromotion.promotionImage?.url : null;
  const promotionEndDate = hasActivePromotion
    ? new Date(activePromotion.promotionId?.endDate || activePromotion.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const newPrice = hasActivePromotion && activePromotion.newPrice
    ? activePromotion.newPrice.toFixed(2)
    : (price * (1 - discountRate / 100)).toFixed(2);
  const oldPrice = hasActivePromotion && activePromotion.oldPrice
    ? activePromotion.oldPrice.toFixed(2)
    : price;

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?._id || !sellerId) return;
      try {
        const response = await axios.get(`${API_URL}/reviews/${product._id}/${sellerId}`);
        const reviews = response.data;
        const avgRating =
          reviews.length > 0
            ? (
                reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
                reviews.length
              ).toFixed(1)
            : 0;
        setAverageRating(parseFloat(avgRating));
        setReviewCount(reviews.length);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setAverageRating(0);
        setReviewCount(0);
      }
    };
    fetchReviews();
  }, [product?._id, sellerId]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error('You must log in to manage your wishlist.');
      return;
    }

    if (isToggling) return;

    setIsToggling(true);
    try {
      if (isWishlisted) {
        const item = wishlistItems.find(
          (item) =>
            item.productId._id === product._id &&
            (item.sellerId?._id === sellerId || (!item.sellerId && !sellerId))
        );
        if (item) {
          await axios.delete(`${WISHLIST_API_URL}/item`, {
            data: { userId: currentUser.id, itemId: item._id },
          });
          dispatch(removeWishlistItem(item._id));
          toast.success('Removed from wishlist');
        }
      } else {
        const response = await axios.post(`${WISHLIST_API_URL}/add`, {
          userId: currentUser.id,
          productId: product._id,
          sellerId,
          price: parseFloat(newPrice),
          stock,
        });

        const newItem = {
          ...response.data.wishlist.items.find(
            (item) =>
              item.productId._id === product._id &&
              (item.sellerId?._id === sellerId || (!item.sellerId && !sellerId))
          ),
          productId: product,
          sellerId: sellerOffer?.sellerId,
        };

        if (newItem) {
          dispatch(addWishlistItem(newItem));
          toast.success('Added to wishlist');
        }
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      const errorMessage =
        err.response?.status === 400
          ? err.response.data.message
          : 'Failed to update wishlist';
      toast.error(errorMessage);
    } finally {
      setIsToggling(false);
    }
  };

  const debouncedWishlistToggle = debounce(handleWishlistToggle, 300, {
    leading: true,
    trailing: false,
  });

  useEffect(() => {
    return () => {
      debouncedWishlistToggle.cancel();
    };
  }, []);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error('You must log in to add items to your cart.');
      return;
    }

    if (stock <= 0) {
      toast.error('This item is out of stock.');
      return;
    }

    try {
      const response = await axios.post(`${CART_API_URL}/add`, {
        userId: currentUser.id,
        productId: product._id,
        sellerId,
        quantity: 1,
        price: parseFloat(newPrice),
      });

      const newItem = response.data.cart.items[response.data.cart.items.length - 1];
      if (!newItem || !newItem._id) {
        throw new Error('Invalid cart item response');
      }

      dispatch(
        addCartItem({
          ...newItem,
          productId: {
            ...product,
            price: parseFloat(newPrice),
            stock,
          },
          sellerId: sellerOffer?.sellerId,
          price: parseFloat(newPrice),
          stock,
        })
      );
      toast.success('Item added to cart');
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const renderStars = () => {
    return Array(5)
      .fill(0)
      .map((_, i) =>
        i < Math.floor(averageRating) ? (
          <FaStar key={i} className="text-yellow-400 w-3 h-3" />
        ) : (
          <FaRegStar key={i} className="text-gray-300 w-3 h-3" />
        )
      );
  };

  const primaryImage = product.images?.[0]?.url;
  const hoverImage = product.images?.[1]?.url;

  return (
    <div
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 relative group overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative pb-[100%] overflow-hidden">
        <Link
          to={`/products/${product._id}${sellerId ? `?seller=${sellerId}` : ''}`}
          className="absolute inset-0"
        >
          {primaryImage && (
            <img
              src={primaryImage}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
                hoverImage && isHovered ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
            />
          )}
          {hoverImage && (
            <img
              src={hoverImage}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          )}
          {!primaryImage && (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </Link>

        {/* Promotion Tag */}
        {hasActivePromotion && (
          <div className="absolute top-2 left-2 z-10 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
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
                        {discountRate}% OFF
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
                        {discountRate}% OFF
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute -top-1 left-2 w-5 h-2 bg-red-700/80 transform rotate-45 origin-bottom-left rounded-sm"></div>
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 rounded-t-lg"></div>
              <div className="absolute z-20 left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg min-w-[150px]">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
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
                      {discountRate}% discount
                    </p>
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      Ends {promotionEndDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <span
            className={`text-[10px] px-2 py-1 rounded-full font-medium ${
              stock > 0
                ? 'text-green-800 bg-green-100/90 backdrop-blur-[1px]'
                : 'text-gray-600 bg-gray-100/90 backdrop-blur-[1px]'
            } ${hasActivePromotion ? 'ml-20' : ''}`}
          >
            {status}
          </span>
          <button
            onClick={debouncedWishlistToggle}
            disabled={isToggling}
            className={`p-1.5 rounded-full transition-all duration-300 ${
              isWishlisted
                ? 'text-red-500 bg-white/80 shadow-sm'
                : 'text-gray-400 hover:text-red-500 bg-white/80 hover:bg-white/90'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isToggling ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : isWishlisted ? (
              <IoMdHeart className="w-4 h-4 fill-current" />
            ) : (
              <IoMdHeartEmpty className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
      </div>

      <div className="p-3">
        <Link
          to={`/products/${product._id}${sellerId ? `?seller=${sellerId}` : ''}`}
          className="block mb-1"
        >
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-[#4C0ADA] transition-colors text-sm">
            {product.name}
          </h3>
        </Link>

        {sellerId && (
          <p className="text-xs text-gray-500 mb-1">
            Sold by:{' '}
            <Link
              to={`/sellers/${sellerId}/products`}
              className="text-[#4C0ADA] hover:underline"
            >
              {shopName}
            </Link>
          </p>
        )}

        <div className="flex items-center mb-1.5">
          <div className="flex mr-1">{renderStars()}</div>
          <span className="text-xs text-gray-500 ml-1">
            {averageRating.toFixed(1)} ({reviewCount}{' '}
            {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1.5">
            <div className="text-base font-bold text-gray-900">
              ${newPrice}
            </div>
            {hasActivePromotion && (
              <div className="text-xs text-gray-500 line-through">${oldPrice}</div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className={`px-3 py-2 rounded-md text-xs flex items-center gap-1.5 transition-all duration-200 ${
              stock > 0
                ? 'bg-[#4C0ADA] text-white hover:bg-[#3A0AA5] shadow-md hover:shadow-lg active:scale-95'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={stock <= 0}
            aria-label="Add to cart"
          >
            <FaShoppingCart className="w-3 h-3" />
            <span>{stock > 0 ? 'Add' : 'Sold'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;