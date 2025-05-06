import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaShoppingCart } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';

const ProductCard = ({ product, sellerOffer }) => {
  const price = sellerOffer.price?.toFixed(2) || '0.00';
  const stock = sellerOffer.stock || 0;
  const status = stock > 0 ? 'In Stock' : 'Out of Stock';
  const warranty = sellerOffer.warranty || 'No warranty';
  
  // Calculate average rating for this seller's offer
  const averageRating = sellerOffer.reviews?.length > 0 
    ? (sellerOffer.reviews.reduce((sum, review) => sum + review.rating, 0)) / sellerOffer.reviews.length
    : 0;
  
  // Check if there's an active promotion
  const hasPromotion = sellerOffer.promotions?.some(p => p.isActive) || sellerOffer.activePromotion;
  
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      {/* Product Image */}
      <div className="relative pb-[75%] overflow-hidden">
        <Link to={`/products/${product._id}?seller=${sellerOffer.sellerId}`}>
          {product.images?.[0] ? (
            <img 
              src={product.images[0].url} 
              alt={product.name}
              className="absolute top-0 left-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute top-0 left-0 w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </Link>
        
        {/* Quick actions and badges */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
            <FiHeart className="text-gray-600 hover:text-red-500" />
          </button>
        </div>
        
        {/* Status badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {status}
        </div>
        
        {/* Promotion badge */}
        {hasPromotion && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Special Offer
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product._id}?seller=${sellerOffer.sellerId}`} className="block">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Seller info would go here - you might want to display seller name/rating */}
        <p className="text-sm text-gray-500 mb-2">Sold by: {sellerOffer.sellerId.name || 'Seller'}</p>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex mr-2">
            {renderStars()}
          </div>
          <span className="text-sm text-gray-500">
            ({sellerOffer.reviews?.length || 0} reviews)
          </span>
        </div>
        
        {/* Warranty */}
        {warranty && warranty !== '' && (
          <p className="text-sm text-blue-600 mb-2">Warranty: {warranty}</p>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xl font-bold text-gray-900">${price}</span>
            {hasPromotion && (
              <span className="ml-2 text-sm text-gray-500 line-through">${(price * 1.2).toFixed(2)}</span>
            )}
          </div>
          
          {/* Add to cart button */}
          <button 
            className={`px-3 py-2 rounded-full flex items-center ${stock > 0 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
            disabled={stock <= 0}
          >
            <FaShoppingCart className="mr-1" />
            <span className="text-sm">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;