import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaShoppingCart } from 'react-icons/fa';
import { IoMdHeart, IoMdHeartEmpty } from 'react-icons/io';
import axios from 'axios';
import { addItem as addWishlistItem, removeItem as removeWishlistItem } from '../redux/user/wishlistSlice';
import { addItem as addCartItem } from '../redux/user/cartSlice';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

const ProductCard = ({ product, sellerOffer, isWishlisted: initialWishlisted, onWishlistToggle }) => {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted || false);
  const [isHovered, setIsHovered] = useState(false);

  const WISHLIST_API_URL = 'http://localhost:8000/api/wishlist';
  const CART_API_URL = 'http://localhost:8000/api/cart';

  useEffect(() => {
    setIsWishlisted(initialWishlisted || false);
  }, [initialWishlisted]);

  const price = (sellerOffer?.price || product?.price || 0).toFixed(2);
  const stock = sellerOffer?.stock ?? product?.stock ?? 0;
  const status = stock > 0 ? 'In Stock' : 'Out of Stock';
  const sellerId = sellerOffer?.sellerId?._id || product?.sellerId?._id;
  const shopName = sellerOffer?.sellerId?.shopName || product?.sellerId?.shopName || 'Seller';

  const reviews = sellerOffer?.reviews || product?.reviews || [];
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const promotions = sellerOffer?.promotions || product?.promotions || [];
  const activePromotion = promotions.find((p) => p.isActive) || sellerOffer?.activePromotion;
  const discountPercentage = activePromotion?.discountPercentage || 0;
  const originalPrice = activePromotion
    ? (price / (1 - discountPercentage / 100)).toFixed(2)
    : null;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error('You must log in to manage your wishlist.');
      return;
    }

    try {
      if (isWishlisted) {
        const response = await axios.get(`${WISHLIST_API_URL}?userId=${currentUser.id}`);
        const wishlist = response.data;
        const item = wishlist.items.find(
          (item) =>
            item.productId._id === product._id &&
            (item.sellerId?._id === sellerId || (!item.sellerId && !sellerId))
        );
        if (item) {
          await axios.delete(`${WISHLIST_API_URL}/item`, {
            data: { userId: currentUser.id, itemId: item._id },
          });
          dispatch(removeWishlistItem(item._id));
          setIsWishlisted(false);
          if (onWishlistToggle) {
            onWishlistToggle(product._id, false, sellerId);
          }
          toast.success('Removed from wishlist');
        }
      } else {
        const response = await axios.post(`${WISHLIST_API_URL}/add`, {
          userId: currentUser.id,
          productId: product._id,
          sellerId,
          price: parseFloat(price),
          stock,
        });
        dispatch(
          addWishlistItem({
            ...response.data.wishlist.items[response.data.wishlist.items.length - 1],
            price: parseFloat(price),
            stock,
          })
        );
        setIsWishlisted(true);
        if (onWishlistToggle) {
          onWishlistToggle(product._id, true, sellerId);
        }
        toast.success('Added to wishlist');
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

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
            price: parseFloat(price),
            stock,
          },
          sellerId: sellerOffer?.sellerId,
          price: parseFloat(price),
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

        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <span
            className={`text-[10px] px-2 py-1 rounded-full font-medium ${
              stock > 0
                ? 'text-green-800 bg-green-100/90 backdrop-blur-[1px]'
                : 'text-gray-600 bg-gray-100/90 backdrop-blur-[1px]'
            }`}
          >
            {status}
          </span>
          <button
            onClick={handleWishlistToggle}
            className={`p-1.5 rounded-full transition-all duration-300 ${
              isWishlisted
                ? 'text-red-500 bg-white/80 shadow-sm'
                : 'text-gray-400 hover:text-red-500 bg-white/80 hover:bg-white/90'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isWishlisted ? (
              <IoMdHeart className="w-4 h-4 fill-current animate-pulse" />
            ) : (
              <IoMdHeartEmpty className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {activePromotion && (
          <div className="absolute bottom-2 left-2">
            <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full font-medium">
              {discountPercentage}% OFF
            </span>
          </div>
        )}
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
            {averageRating} ({reviews.length})
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="text-base font-bold text-gray-900">${price}</div>
            {originalPrice && (
              <div className="text-xs text-gray-400 line-through">
                ${originalPrice}
              </div>
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

export default React.memo(ProductCard);