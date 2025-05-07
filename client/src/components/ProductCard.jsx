import React, { useState, useEffect } from 'react';
import { Link} from 'react-router-dom';
import { FaStar, FaRegStar, FaShoppingCart } from 'react-icons/fa';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import axios from 'axios';
import { addWishlistItem, removeWishlistItem } from '../redux/user/wishlistSlice';
import { useSelector ,useDispatch } from 'react-redux';

const ProductCard = ({ product, sellerOffer, onWishlistToggle }) => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // API base URL
  const API_URL = 'http://localhost:8000/api/wishlist';

  // Check wishlist status on mount if user is logged in
  useEffect(() => {
    if (currentUser) {
      const checkWishlistStatus = async () => {
        try {
          const response = await axios.get(`${API_URL}?userId=${currentUser.id}`);
          const wishlist = response.data;
          const isInWishlist = wishlist.items.some(
            item =>
              item.productId._id === product._id &&
              (item.sellerId?._id === sellerOffer?.sellerId?._id || (!item.sellerId && !sellerOffer?.sellerId))
          );
          setIsWishlisted(isInWishlist);
        } catch (err) {
          console.error('Failed to check wishlist status:', err);
        }
      };
      checkWishlistStatus();
    }
  }, [currentUser, product._id, sellerOffer?.sellerId]);

  // Extract product details
  const price = sellerOffer?.price?.toFixed(2) || '0.00';
  const stock = sellerOffer?.stock || 0;
  const status = stock > 0 ? 'In Stock' : 'Out of Stock';
  const sellerId = sellerOffer?.sellerId?._id;
  const shopName = sellerOffer?.sellerId?.shopName || 'Seller';

  // Rating calculation
  const averageRating = sellerOffer?.reviews?.length > 0 
    ? (sellerOffer.reviews.reduce((sum, review) => sum + review.rating, 0) / sellerOffer.reviews.length).toFixed(1)
    : 0;

  // Promotions
  const activePromotion = sellerOffer?.promotions?.find(p => p.isActive) || sellerOffer?.activePromotion;
  const discountPercentage = activePromotion?.discountPercentage || 0;
  const originalPrice = activePromotion ? (price / (1 - discountPercentage/100)).toFixed(2) : null;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert('You must log in to manage your wishlist.');
      return;
    }

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const response = await axios.get(`${API_URL}?userId=${currentUser.id}`);
        const wishlist = response.data;
        const item = wishlist.items.find(
          item =>
            item.productId._id === product._id &&
            (item.sellerId?._id === sellerId || (!item.sellerId && !sellerId))
        );
        if (item) {
          await axios.delete(`${API_URL}/item`, {
            data: { userId: currentUser.id, itemId: item._id }
          });
          dispatch(removeWishlistItem(item._id));
          setIsWishlisted(false);
          if (onWishlistToggle) {
            onWishlistToggle(product._id, false, sellerId);
          }
        }
      } else {
        // Add to wishlist
        const response = await axios.post(`${API_URL}/add`, {
          userId: currentUser.id,
          productId: product._id,
          sellerId
        });
        dispatch(addWishlistItem(response.data.wishlist.items[response.data.wishlist.items.length - 1]));
        setIsWishlisted(true);
        if (onWishlistToggle) {
          onWishlistToggle(product._id, true, sellerId);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const renderStars = () => {
    return Array(5).fill(0).map((_, i) => (
      i < Math.floor(averageRating) ? (
        <FaStar key={i} className="text-yellow-400 w-3 h-3" />
      ) : (
        <FaRegStar key={i} className="text-gray-300 w-3 h-3" />
      )
    ));
  };

  const primaryImage = product.images?.[0]?.url;
  const hoverImage = product.images?.[1]?.url;

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 relative group overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative pb-[100%] overflow-hidden">
        {/* Image with hover effect */}
        <Link 
          to={`/products/${product._id}${sellerId ? `?seller=${sellerId}` : ''}`}
          className="absolute inset-0"
        >
          {/* Primary image */}
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
          
          {/* Hover image */}
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
          
          {/* Fallback image */}
          {!primaryImage && (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </Link>

        {/* Top badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {/* Improved stock status badge */}
          <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
            stock > 0 
              ? 'text-green-800 bg-green-100/90 backdrop-blur-[1px]' 
              : 'text-gray-600 bg-gray-100/90 backdrop-blur-[1px]'
          }`}>
            {status}
          </span>
          
          {/* Elegant wishlist button */}
          <button 
            onClick={handleWishlistToggle}
            className={`p-1.5 rounded-full transition-all duration-300 ${
              isWishlisted 
                ? 'text-red-500 bg-white/80 shadow-sm' 
                : 'text-gray-400 hover:text-red-500 bg-white/80 hover:bg-white/90'
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isWishlisted ? (
              <IoMdHeart className="w-4 h-4 fill-current animate-pulse" />
            ) : (
              <IoMdHeartEmpty className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Discount badge */}
        {activePromotion && (
          <div className="absolute bottom-2 left-2">
            <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full font-medium">
              {discountPercentage}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Product name */}
        <Link 
          to={`/products/${product._id}${sellerId ? `?seller=${sellerId}` : ''}`}
          className="block mb-1"
        >
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-[#4C0ADA] transition-colors text-sm">
            {product.name}
          </h3>
        </Link>
        
        {/* Seller info */}
        {sellerId && (
          <p className="text-xs text-gray-500 mb-1">
            Sold by: <Link 
              to={`/sellers/${sellerId}/products`} 
              className="text-[#4C0ADA] hover:underline"
            >
              {shopName}
            </Link>
          </p>
        )}
        
        {/* Rating and reviews */}
        <div className="flex items-center mb-1.5">
          <div className="flex mr-1">
            {renderStars()}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            {averageRating} ({sellerOffer?.reviews?.length || 0})
          </span>
        </div>
        
        {/* Price section */}
        <div className="flex items-center justify-between mt-2">
          <div>
            {/* Current price */}
            <div className="text-base font-bold text-gray-900">
              ${price}
            </div>
            
            {/* Original price */}
            {originalPrice && (
              <div className="text-xs text-gray-400 line-through">
                ${originalPrice}
              </div>
            )}
          </div>
          
          {/* Enhanced Add to cart button */}
          <button 
            className={`px-3 py-2 rounded-md text-xs flex items-center gap-1.5 transition-all duration-200 ${
              stock > 0 
                ? 'bg-[#4C0ADA] text-white hover:bg-[#3A0AA5] shadow-md hover:shadow-lg active:scale-95' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={stock <= 0}
          >
            <FaShoppingCart className="w-3 h-3" />
            <span>{stock > 0 ? 'Add' : 'Sold'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);