import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaChevronRight, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const ProfileWishlist = () => {
  const { t } = useTranslation();
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const isEmpty = wishlistItems.length === 0;
  const displayItems = wishlistItems.slice(0, 5); // Show max 5 items in stack

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: (i) => ({
      y: i * 8,
      x: Math.sin(i * 0.5) * 20, // Wave pattern
      rotate: i % 2 === 0 ? -i * 2 : i * 2, // Alternating rotation
      opacity: 1,
      transition: {
        delay: i * 0.15,
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    }),
    hover: {
      y: -15,
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 15, -15, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="p-3 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 shadow-lg">
              <FaHeart className="text-xl text-pink-600" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {t("profile.wishlist.title")}
              </h2>
              <p className="text-sm text-gray-500">
                {isEmpty
                  ? t("profile.wishlist.emptySubtitle")
                  : `${wishlistItems.length} loved items`}
              </p>
            </div>
          </div>
          {!isEmpty && (
            <Link
              to="/wishlist"
              className="flex items-center gap-1 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100">
              <span className="text-sm font-medium">View all</span>
              <FaChevronRight className="text-xs text-purple-600" />
            </Link>
          )}
        </motion.div>

        {/* Content */}
        <AnimatePresence>
          {isEmpty ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-inner">
              <div className="relative w-28 h-28 mb-6">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 bg-pink-200 rounded-full"
                />
                <FaHeart className="absolute inset-0 m-auto text-4xl text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {t("profile.wishlist.emptyTitle")}
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-xs">
                {t("profile.wishlist.emptyDescription")}
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all">
                <FaPlus />
                <span>Discover products</span>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="relative h-72">
              {/* Floating background elements */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                }}
                className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-pink-100 blur-xl"
              />
              <motion.div
                animate={{
                  y: [0, 15, 0],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  delay: 2,
                }}
                className="absolute -right-10 bottom-10 w-40 h-40 rounded-full bg-purple-100 blur-xl"
              />

              {/* Card Stack */}
              {displayItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  custom={index}
                  variants={cardVariants}
                  whileHover={index === 0 ? "hover" : undefined}
                  className={`absolute w-44 h-60 rounded-2xl shadow-lg overflow-hidden cursor-pointer ${
                    index === 0
                      ? "z-20 border-2 border-white shadow-xl"
                      : index === 1
                      ? "z-18 opacity-95"
                      : index === 2
                      ? "z-16 opacity-90"
                      : index === 3
                      ? "z-14 opacity-85"
                      : "z-12 opacity-80"
                  }`}
                  style={{
                    backgroundImage: `url(${
                      item.productId.images[0]?.url ||
                      "/placeholder-product.jpg"
                    })`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    transformOrigin: "bottom center",
                  }}>
                  <Link
                    to={`/product/${item.productId.slug}`}
                    className="block h-full w-full">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Product name on all visible cards */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-sm font-semibold line-clamp-1 drop-shadow-lg">
                        {item.productId.name}
                      </h3>
                    </div>

                    {/* Heart indicator */}
                    <div className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm">
                      <FaHeart className="text-xs text-pink-500" />
                    </div>
                  </Link>
                </motion.div>
              ))}

              {/* More items indicator */}
              {wishlistItems.length > displayItems.length && (
                <motion.div
                  custom={displayItems.length}
                  variants={cardVariants}
                  className="absolute z-10 w-44 h-60 rounded-2xl bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center shadow-inner border-2 border-dashed border-gray-200">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <span className="text-purple-600 font-bold text-lg">
                      +{wishlistItems.length - displayItems.length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    More loves
                  </p>
                  <p className="text-xs text-gray-400 mt-1">View all to see</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileWishlist;
