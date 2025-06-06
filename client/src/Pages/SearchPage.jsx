import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { FaSpinner, FaShoppingBag, FaFilter, FaSearch, FaTimes, FaStar } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';

const SearchPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const wishlistItems = useSelector((state) => state.wishlist.items || []);

  // Initialize search query from URL
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  // State for search parameters
  const [searchParams, setSearchParams] = useState({
    q: initialQuery,
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    inStock: false,
    page: 1,
    limit: 20,
  });

  // State for mobile filters visibility
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // State for API data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:8000/api/wishlist';

  // Update URL when searchParams.q changes
  useEffect(() => {
    if (searchParams.q !== initialQuery) {
      navigate(`/search?q=${encodeURIComponent(searchParams.q)}`, { replace: true });
    }
  }, [searchParams.q, navigate, initialQuery]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/categories');
        setCategories(response.data);
      } catch (err) {
        setError(t('productCategory.errors.loadError'));
      }
    };
    fetchCategories();
  }, [t]);

  // Fetch wishlist on mount if user is logged in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(`${API_URL}?userId=${currentUser.id}`);
          dispatch({
            type: 'wishlist/setWishlist',
            payload: response.data.items.map((item) => ({
              ...item,
              price: item.price || item.productId?.price || 0,
              stock: item.stock || item.productId?.stock || 0,
              productId: {
                ...item.productId,
                reviews: item.productId.reviews || [],
                promotions: item.productId.promotions || [],
              },
            })),
          });
        } catch (err) {
          toast.error(t('productCategory.errors.wishlist.loadError'));
        }
      }
    };
    fetchWishlist();
  }, [currentUser, dispatch, t]);

  // Fetch products when searchParams change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:8000/api/products/search', {
          params: searchParams,
        });
        console.log('API Response:', response.data.products);
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setTotalProducts(response.data.total);
      } catch (err) {
        setError(err.response?.data?.message || t('productCategory.errors.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams, t]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      page: 1,
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (productId, isAdded, sellerId) => {
    if (!currentUser) {
      toast.error(t('productCategory.errors.wishlist.loginRequired'));
      return;
    }

    try {
      if (isAdded) {
        const product = products.find((p) => p._id === productId);
        const sellerOffer = product?.sellers.find((s) => s.sellerId._id === sellerId || s.sellerId === sellerId);
        const response = await axios.post(`${API_URL}/add`, {
          userId: currentUser.id,
          productId,
          sellerId,
          price: sellerOffer?.effectivePrice || sellerOffer?.price || product?.price || 0,
          stock: sellerOffer?.stock || product?.stock || 0,
        });
        dispatch({
          type: 'wishlist/addItem',
          payload: {
            ...response.data.wishlist.items[response.data.wishlist.items.length - 1],
            price: sellerOffer?.effectivePrice || sellerOffer?.price || product?.price || 0,
            stock: sellerOffer?.stock || product?.stock || 0,
          },
        });
        toast.success(t('productCategory.errors.wishlist.addSuccess'));
      } else {
        const response = await axios.get(`${API_URL}?userId=${currentUser.id}`);
        const wishlist = response.data;
        const item = wishlist.items.find(
          (item) =>
            item.productId._id === productId &&
            (item.sellerId?._id === sellerId || (!item.sellerId && !sellerId))
        );
        if (item) {
          await axios.delete(`${API_URL}/item`, {
            data: { userId: currentUser.id, itemId: item._id },
          });
          dispatch({ type: 'wishlist/removeItem', payload: item._id });
          toast.success(t('productCategory.errors.wishlist.removeSuccess'));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t('productCategory.errors.wishlist.error'));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({
      q: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      inStock: false,
      page: 1,
      limit: 20,
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mobile filter dialog */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-40 w-full max-w-xs overflow-y-auto bg-white px-4 py-4 sm:max-w-sm">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-lg font-medium text-gray-900">{t('search.filters')}</h2>
              <button
                type="button"
                className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Filters */}
            <div className="mt-4 space-y-6">
              <div>
                <label htmlFor="mobile-search" className="block text-sm font-medium text-gray-700">
                  {t('search.search')}
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="q"
                    id="mobile-search"
                    value={searchParams.q}
                    onChange={handleInputChange}
                    placeholder={t('search.placeholder')}
                    className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mobile-category" className="block text-sm font-medium text-gray-700">
                  {t('search.category')}
                </label>
                <select
                  id="mobile-category"
                  name="category"
                  value={searchParams.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">{t('search.allCategories')}</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Price Range */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {t('search.priceRange')}
                </h3>
                <div className="px-2">
                  <div className="relative h-1 bg-gray-200 rounded-full mb-6">
                    <div 
                      className="absolute h-1 bg-indigo-500 rounded-full"
                      style={{
                        left: `${(searchParams.minPrice / 1000) * 10}%`,
                        right: `${100 - (searchParams.maxPrice / 1000) * 10}%`
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={searchParams.minPrice || 0}
                      onChange={(e) => setSearchParams(prev => ({
                        ...prev,
                        minPrice: e.target.value,
                        page: 1
                      }))}
                      className="absolute w-full h-1 opacity-0 cursor-pointer -top-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={searchParams.maxPrice || 1000}
                      onChange={(e) => setSearchParams(prev => ({
                        ...prev,
                        maxPrice: e.target.value,
                        page: 1
                      }))}
                      className="absolute w-full h-1 opacity-0 cursor-pointer -top-1"
                    />
                  </div>
                  <div className="flex justify-between">
                    <div className="relative">
                      <input
                        type="number"
                        name="minPrice"
                        value={searchParams.minPrice || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        name="maxPrice"
                        value={searchParams.maxPrice || ''}
                        onChange={handleInputChange}
                        placeholder="1000"
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Rating */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {t('search.rating')}
                </h3>
                <div className="flex flex-col space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setSearchParams(prev => ({
                        ...prev,
                        rating: prev.rating === rating.toString() ? '' : rating.toString()
                      }))}
                      className={`flex items-center group ${searchParams.rating === rating.toString() ? 'text-amber-500' : 'text-gray-400 hover:text-amber-400'}`}
                    >
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 ${i < rating ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium group-hover:text-gray-700">
                        {rating === 5 && t('search.rating5')}
                        {rating === 4 && t('search.rating4')}
                        {rating === 3 && t('search.rating3')}
                        {rating === 2 && t('search.rating2')}
                        {rating === 1 && t('search.rating1')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="mobile-in-stock"
                  name="inStock"
                  type="checkbox"
                  checked={searchParams.inStock}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="mobile-in-stock" className="ml-2 text-sm text-gray-700">
                  {t('search.inStock')}
                </label>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-1/2 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  {t('search.clearFilters')}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-1/2 rounded-md border border-transparent bg-indigo-600 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {t('search.applyFilters')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t('productCategory.title')}
          </h1>

          <div className="flex items-center">
            <button
              type="button"
              className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <span className="sr-only">Filters</span>
              <FaFilter className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="pt-6 lg:grid lg:grid-cols-5 lg:gap-x-8">
          {/* Sidebar Filters */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="space-y-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('search.search')}
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="q"
                    id="search"
                    value={searchParams.q}
                    onChange={handleInputChange}
                    placeholder={t('search.placeholder')}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {t('search.category')}
                </h3>
                <select
                  name="category"
                  value={searchParams.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">{t('search.allCategories')}</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range - Creative Slider */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  {t('search.priceRange')}
                </h3>
                <div className="px-2">
                  <div className="relative h-1 bg-gray-200 rounded-full mb-6">
                    <div 
                      className="absolute h-1 bg-indigo-500 rounded-full"
                      style={{
                        left: `${(searchParams.minPrice / 1000) * 10}%`,
                        right: `${100 - (searchParams.maxPrice / 1000) * 10}%`
                      }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={searchParams.minPrice || 0}
                      onChange={(e) => setSearchParams(prev => ({
                        ...prev,
                        minPrice: e.target.value,
                        page: 1
                      }))}
                      className="absolute w-full h-1 opacity-0 cursor-pointer -top-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="10"
                      value={searchParams.maxPrice || 1000}
                      onChange={(e) => setSearchParams(prev => ({
                        ...prev,
                        maxPrice: e.target.value,
                        page: 1
                      }))}
                      className="absolute w-full h-1 opacity-0 cursor-pointer -top-1"
                    />
                    <div className="absolute -top-1 left-0 w-4 h-4 bg-indigo-600 rounded-full shadow-md transform -translate-x-1/2" />
                    <div className="absolute -top-1 right-0 w-4 h-4 bg-indigo-600 rounded-full shadow-md transform translate-x-1/2" />
                  </div>
                  <div className="flex justify-between">
                    <div className="relative">
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                        Min
                      </span>
                      <input
                        type="number"
                        name="minPrice"
                        value={searchParams.minPrice || ''}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                        Max
                      </span>
                      <input
                        type="number"
                        name="maxPrice"
                        value={searchParams.maxPrice || ''}
                        onChange={handleInputChange}
                        placeholder="1000"
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating - Creative Stars */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {t('search.rating')}
                </h3>
                <div className="flex flex-col space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setSearchParams(prev => ({
                        ...prev,
                        rating: prev.rating === rating.toString() ? '' : rating.toString()
                      }))}
                      className={`flex items-center group ${searchParams.rating === rating.toString() ? 'text-amber-500' : 'text-gray-400 hover:text-amber-400'}`}
                    >
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 ${i < rating ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium group-hover:text-gray-700">
                        {rating === 5 && t('search.rating5')}
                        {rating === 4 && t('search.rating4')}
                        {rating === 3 && t('search.rating3')}
                        {rating === 2 && t('search.rating2')}
                        {rating === 1 && t('search.rating1')}
                      </span>
                      {searchParams.rating === rating.toString() && (
                        <span className="ml-auto text-xs text-gray-500">
                          <FaTimes className="inline" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock */}
              <div className="flex items-center">
                <input
                  id="inStock"
                  name="inStock"
                  type="checkbox"
                  checked={searchParams.inStock}
                  onChange={handleInputChange}
                  className="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                  {t('search.inStock')}
                </label>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('search.clearFilters')}
              </button>
            </div>
          </div>

          {/* Product grid */}
          <div className="lg:col-span-4">
            {/* Content Area */}
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                <FaSpinner className="animate-spin text-3xl text-indigo-600" />
                <p className="text-gray-600">{t('productCategory.loading')}</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{t('productCategory.errors.loadError')}</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                    >
                      {t('cart.errors.tryAgain')}
                    </button>
                  </div>
                </div>
              </div>
            ) : products.length > 0 ? (
              <>
                {/* Products Summary */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600 text-sm">
                    {t('productCategory.showing')}{' '}
                    <span className="font-medium text-gray-900">{products.flatMap((p) => p.sellers).length}</span>{' '}
                    {t('productCategory.products')}
                  </p>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.flatMap((product) =>
                    product.sellers.map((sellerOffer) => {
                      const isWishlisted = wishlistItems.some(
                        (item) =>
                          item.productId._id === product._id &&
                          (item.sellerId?._id === (sellerOffer.sellerId?._id || sellerOffer.sellerId) || (!item.sellerId && !sellerOffer.sellerId))
                      );
                      const transformedPromotions = sellerOffer.promotions?.map((promo) => ({
                        isActive: promo.isActive ?? true,
                        promotionId: {
                          _id: promo.promotionId || promo._id,
                          name: promo.name || 'Special Offer',
                          discountRate: promo.discountRate || 0,
                          image: promo.image || (promo.imageUrl ? { url: promo.imageUrl } : null),
                          endDate: promo.endDate || null,
                        },
                      }));
                      const transformedActivePromotion = sellerOffer.activePromotion
                        ? {
                            _id: sellerOffer.activePromotion._id || sellerOffer.activePromotion,
                            name: sellerOffer.activePromotion.name || 'Special Offer',
                            discountRate: sellerOffer.activePromotion.discountRate || 0,
                            image: sellerOffer.activePromotion.image || (sellerOffer.activePromotion.imageUrl ? { url: sellerOffer.activePromotion.imageUrl } : null),
                            endDate: sellerOffer.activePromotion.endDate || null,
                          }
                        : null;

                      return (
                        <ProductCard
                          key={`${product._id}-${sellerOffer.sellerId?._id || sellerOffer.sellerId}`}
                          product={{
                            _id: product._id,
                            name: product.name,
                            images: product.images,
                            sellerId: product.sellerId,
                          }}
                          sellerOffer={{
                            sellerId: {
                              _id: sellerOffer.sellerId?._id || sellerOffer.sellerId,
                              shopName: sellerOffer.shopName || 'Unknown Seller',
                            },
                            price: sellerOffer.price,
                            effectivePrice: sellerOffer.effectivePrice,
                            stock: sellerOffer.stock,
                            promotions: transformedPromotions || [],
                            activePromotion: transformedActivePromotion,
                          }}
                          isWishlisted={isWishlisted}
                          onWishlistToggle={handleWishlistToggle}
                        />
                      );
                    })
                  )}
                </div>

                {/* Pagination */}
                {totalProducts > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-8 border-t border-gray-200 pt-6">
                    <p className="text-gray-600 text-sm mb-4 sm:mb-0">
                      {t('search.showing', {
                        start: (searchParams.page - 1) * searchParams.limit + 1,
                        end: Math.min(searchParams.page * searchParams.limit, totalProducts),
                        total: totalProducts,
                      })}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(searchParams.page - 1)}
                        disabled={searchParams.page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {t('search.previous')}
                      </button>
                      <button
                        onClick={() => handlePageChange(searchParams.page + 1)}
                        disabled={searchParams.page === totalPages}
                        className="px-4 py-2 border border-transparent rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {t('search.next')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="max-w-md mx-auto text-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FaShoppingBag className="w-16 h-16 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {t('productCategory.noProducts.title')}
                </h3>
                <p className="text-gray-600 mb-8">
                  {t('productCategory.noProducts.description')}
                </p>
                <button
                  onClick={clearFilters}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {t('search.clearFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;