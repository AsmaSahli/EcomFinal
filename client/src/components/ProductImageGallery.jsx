import React, { useState, useEffect } from 'react';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';

const ProductImageGallery = ({ images, productName, currentSeller, hasDiscount }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Handle keyboard navigation in gallery
  useEffect(() => {
    if (showGalleryModal) {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setShowGalleryModal(false);
        if (e.key === 'ArrowLeft') handlePrevImage();
        if (e.key === 'ArrowRight') handleNextImage();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showGalleryModal, selectedImage]);

  const handleNextImage = () => {
    setSelectedImage(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = () => {
    setSelectedImage(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="md:w-1/2 p-6">
      <div className="relative group">
        <div className="relative h-80 md:h-96 mb-4 rounded-lg overflow-hidden bg-gray-50">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedImage}
              src={images[selectedImage]?.url || 'https://via.placeholder.com/400'}
              alt={productName}
              className="w-full h-full object-contain cursor-zoom-in"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowGalleryModal(true)}
            />
          </AnimatePresence>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
              >
                <BsChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
              >
                <BsChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setShowGalleryModal(true)}
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
          >
            <FaExpand size={14} />
          </button>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              {currentSeller.promotions[0].discountPercentage}% OFF
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        <div className="flex space-x-2 overflow-x-auto py-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-md border-2 overflow-hidden transition-all ${
                selectedImage === index ? 'border-purple-500' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image.url || 'https://via.placeholder.com/100'}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showGalleryModal && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setShowGalleryModal(false)}
            >
              <FaCompress size={20} />
            </button>

            <div className="relative max-w-6xl w-full h-full flex items-center">
              <button
                className="absolute left-4 text-white p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                onClick={handlePrevImage}
              >
                <BsChevronLeft size={24} />
              </button>

              <div className="w-full h-full flex items-center justify-center">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]?.url || 'https://via.placeholder.com/800'}
                  alt={`${productName} full view`}
                  className="max-h-full max-w-full object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <button
                className="absolute right-4 text-white p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                onClick={handleNextImage}
              >
                <BsChevronRight size={24} />
              </button>
            </div>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="flex space-x-2 overflow-x-auto max-w-full px-4 py-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                      selectedImage === i ? 'border-white' : 'border-transparent hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img.url || 'https://via.placeholder.com/100'}
                      alt={`${productName} thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductImageGallery;