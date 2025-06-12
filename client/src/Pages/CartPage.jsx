import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { FaTrash, FaChevronRight, FaPlus, FaMinus } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import {
  setCart,
  removeItem,
  updateItemQuantity,
  clearCart,
} from "../redux/user/cartSlice";
import { useTranslation } from "react-i18next";

const CartPage = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart?.items || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [updatingQuantity, setUpdatingQuantity] = useState(null);

  const API_URL = "http://localhost:8000/api/cart";

  useEffect(() => {
    if (currentUser?.id) {
      const fetchCart = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `${API_URL}?userId=${currentUser.id}&populate=productId,sellerId`
          );
          const validItems = response.data.items
            .filter(
              (item) => item._id && item.productId?._id && item.sellerId?._id
            )
            .map((item) => ({
              ...item,
              productId: {
                ...item.productId,
                images: item.productId.images || [],
              },
              inStock: item.stock > 0,
            }));

          dispatch(setCart(validItems));
          setError(null);
        } catch (err) {
          // Only set error for actual server errors (not 404 or empty cart)
          if (err.response?.status >= 500) {
            setError(err.response?.data?.message || t("cart.errors.loadError"));
            toast.error(t("cart.errors.loadError"));
          } else {
            // For non-error responses (e.g., empty cart), clear error and set empty cart
            dispatch(setCart([]));
            setError(null);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchCart();
    } else {
      setLoading(false);
      dispatch(setCart([]));
      setError(null);
    }
  }, [currentUser, dispatch, t]);

  const handleRemoveItem = async (itemId) => {
    setRemovingItem(itemId);
    try {
      await axios.delete(`${API_URL}/item`, {
        data: { userId: currentUser.id, itemId },
      });
      dispatch(removeItem(itemId));
      toast.success(t("cart.product.remove"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("cart.errors.removeError"));
    } finally {
      setRemovingItem(null);
    }
  };

  const handleUpdateQuantity = async (itemId, quantity, stock) => {
    if (quantity < 1) {
      toast.error(t("cart.errors.quantityMin"));
      return;
    }
    if (quantity > stock) {
      toast.error(t("cart.errors.quantityMax", { stock }));
      return;
    }

    setUpdatingQuantity(itemId);
    try {
      const response = await axios.put(`${API_URL}/item/quantity`, {
        userId: currentUser.id,
        itemId,
        quantity,
      });
      dispatch(updateItemQuantity({ itemId, quantity }));
      toast.success(t("cart.product.quantity"));
      return response.data.cart;
    } catch (err) {
      toast.error(
        err.response?.data?.message || t("cart.errors.quantityError")
      );
      throw err;
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm(t("cart.errors.clearConfirm"))) return;

    try {
      await axios.delete(API_URL, { data: { userId: currentUser.id } });
      dispatch(clearCart());
      toast.success(t("cart.clearCart"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("cart.errors.clearError"));
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.19;
  const total = (subtotal + shipping + tax).toFixed(2);

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-50 mb-4">
            <IoMdCart className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {t("cart.authRequired.title")}
          </h2>
          <p className="text-gray-500 mb-6">
            {t("cart.authRequired.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="btn btn-primary btn-sm gap-2">
              {t("cart.authRequired.signIn")}
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="btn btn-outline btn-primary btn-sm gap-2">
              {t("cart.authRequired.createAccount")}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <IoMdCart className="text-3xl text-purple-600" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {cartItems.length}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {t("cart.title")}
              </h1>
              <p className="text-sm text-gray-500">
                {cartItems.length}{" "}
                {cartItems.length === 1 ? t("cart.item") : t("cart.items")}
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 text-sm">
              <FaTrash className="w-3 h-3" />
              {t("cart.clearCart")}
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 mx-auto">
              <span className="text-red-500">!</span>
            </div>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary btn-sm">
              {t("cart.errors.tryAgain")}
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-lg shadow-sm border p-6 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 relative mb-4 mx-auto">
              <IoMdCart className="h-full w-full text-purple-200" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {t("cart.emptyCart.title")}
            </h3>
            <p className="text-gray-500 mb-4">
              {t("cart.emptyCart.description")}
            </p>
            <button
              onClick={() => navigate("/")}
              className="btn btn-primary btn-sm gap-1">
              {t("cart.emptyCart.button")}
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="flex p-3 gap-3">
                      {/* Product Image */}
                      <Link
                        to={`/products/${item.productId._id}?seller=${item.sellerId._id}`}
                        className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={
                            item.productId.images?.[0]?.url ||
                            "https://via.placeholder.com/150"
                          }
                          alt={item.productId.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span
                          className={`absolute top-0.5 right-0.5 text-[9px] px-1.5 py-0.5 rounded ${
                            item.inStock
                              ? "text-green-800 bg-green-100/90"
                              : "text-red-800 bg-red-100/90"
                          }`}>
                          {item.inStock
                            ? t("cart.product.inStock")
                            : t("cart.product.outOfStock")}
                        </span>
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link
                              to={`/products/${item.productId._id}?seller=${item.sellerId._id}`}
                              className="text-sm font-medium text-gray-800 hover:text-purple-600 line-clamp-2">
                              {item.productId.name}
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                              {t("cart.product.soldBy")}:{" "}
                              {item.sellerId.shopName}
                            </p>
                            {item.promotion && (
                              <p className="text-xs text-red-600 mt-0.5">
                                {t("product.specialOffer")}:{" "}
                                {item.promotion.promotionId.name} (
                                {item.promotion.promotionId.discountRate}%{" "}
                                {t("product.off")})
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={removingItem === item._id}
                            className="text-gray-400 hover:text-red-500 text-sm"
                            aria-label={t("cart.product.remove")}>
                            {removingItem === item._id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <FaTrash className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        <div className="mt-auto pt-2 flex items-end justify-between">
                          <div className="text-base font-bold text-gray-800">
                            ${item.price.toFixed(2)}
                            {item.promotion && (
                              <span className="text-xs text-gray-500 line-through ml-2">
                                ${item.promotion.oldPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-md overflow-hidden bg-gray-50">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item._id,
                                    item.quantity - 1,
                                    item.stock
                                  )
                                }
                                disabled={
                                  item.quantity <= 1 ||
                                  !item.inStock ||
                                  updatingQuantity === item._id
                                }
                                className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 text-xs"
                                aria-label={t("cart.product.quantity")}>
                                {updatingQuantity === item._id ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <FaMinus className="w-2.5 h-2.5" />
                                )}
                              </button>
                              <span className="px-2 py-0.5 text-center min-w-[1.5rem] text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item._id,
                                    item.quantity + 1,
                                    item.stock
                                  )
                                }
                                disabled={
                                  !item.inStock ||
                                  updatingQuantity === item._id ||
                                  item.quantity >= item.stock
                                }
                                className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30 text-xs"
                                aria-label={t("cart.product.quantity")}>
                                {updatingQuantity === item._id ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <FaPlus className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Item Total */}
                    <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex justify-between text-sm">
                      <span className="text-gray-500">
                        {t("cart.product.itemTotal")}
                      </span>
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                  {t("cart.orderSummary.title")}
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("cart.orderSummary.subtotal")}
                    </span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("cart.orderSummary.shipping")}
                    </span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">
                          {t("cart.orderSummary.freeShipping")}
                        </span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("cart.orderSummary.tax")}
                    </span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-bold">
                    <span>{t("cart.orderSummary.total")}</span>
                    <span className="text-purple-600">${total}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="btn btn-primary w-full gap-2 hover:shadow-lg transition-all"
                  disabled={cartItems.some((item) => !item.inStock)}
                  aria-label={t("cart.orderSummary.checkout")}>
                  {t("cart.orderSummary.checkout")}
                  <FaChevronRight />
                </button>

                {cartItems.some((item) => !item.inStock) && (
                  <div className="mt-4 text-sm text-red-500 text-center">
                    {t("cart.errors.removeOutOfStock")}
                  </div>
                )}

                <div className="mt-6 text-center">
                  <Link
                    to="/"
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center justify-center gap-1">
                    {t("cart.orderSummary.continueShopping")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CartPage;
