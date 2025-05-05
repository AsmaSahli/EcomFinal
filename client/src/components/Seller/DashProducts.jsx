import React, { useState, useEffect, useCallback } from 'react';
import { FaEye, FaEdit, FaTrash, FaSearch, FaSpinner, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ProductViewModal from './ProductViewModal';
import debounce from 'lodash.debounce';

const API_BASE_URL = 'http://localhost:8000/api';

const DashProducts = () => {
  const currentUser = useSelector(state => state.user.currentUser);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue, page) => {
      fetchProducts(searchValue, page);
    }, 500),
    []
  );

  const fetchProducts = async (search = '', page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/products/seller/${currentUser.id}`, {
        params: {
          page,
          limit: productsPerPage,
          search
        }
      });
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      debouncedSearch(searchTerm, currentPage);
    }

    // Cleanup debounce on unmount
    return () => {
      debouncedSearch.cancel();
    };
  }, [currentUser, currentPage, productsPerPage, searchTerm, debouncedSearch]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleProductUpdate = (updatedProduct) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    setSuccessMessage('Product updated successfully!');
  };

  const handleRemoveFromInventory = async (productId, sellerId) => {
    if (window.confirm('Are you sure you want to remove this product from your inventory?')) {
      try {
        setDeleteLoading(productId);
        await axios.delete(`${API_BASE_URL}/products/${productId}/sellers/${sellerId}`);
        
        // Option 1: Remove product completely from list
        setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
        
        // Option 2: Just remove current seller from product's sellers array
        // setProducts(prevProducts => 
        //   prevProducts.map(p => 
        //     p._id === productId 
        //       ? {...p, sellers: p.sellers.filter(s => s.sellerId._id !== sellerId)} 
        //       : p
        //   )
        // );
        
        setSuccessMessage('Product removed from inventory successfully!');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to remove product');
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  // Auto-dismiss success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate page numbers
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Modal */}
      {showModal && (
        <ProductViewModal 
          product={selectedProduct} 
          onClose={handleCloseModal} 
          onUpdate={handleProductUpdate}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Products</h1>
          <p className="text-gray-500 mt-1">Manage your product listings</p>
        </div>
        <Link
          to="/seller-dashboard?tab=add-inventory"
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <FaPlus className="mr-2" />
          Add New Product
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md shadow-sm mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, reference, or category..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 focus:bg-white transition-all"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length > 0 ? (
                products.map((product) => {
                  const sellerInfo = product.sellers.find(s => s.sellerId._id === currentUser.id);
                  if (!sellerInfo) return null;

                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images.length > 0 && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3 rounded-lg overflow-hidden border border-gray-200">
                              <img className="h-full w-full object-cover" src={product.images[0].url} alt={product.name} />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded-md inline-block">
                          {product.reference}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded-md">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${sellerInfo?.price?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sellerInfo?.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${sellerInfo?.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {sellerInfo?.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-full hover:bg-indigo-50 transition-colors"
                            title="View"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-yellow-600 hover:text-yellow-900 p-1.5 rounded-full hover:bg-yellow-50 transition-colors"
                            title="Edit"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveFromInventory(product._id, sellerInfo.sellerId._id)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                            title="Remove from Inventory"
                            disabled={deleteLoading === product._id}
                          >
                            {deleteLoading === product._id ? (
                              <FaSpinner className="h-4 w-4 animate-spin" />
                            ) : (
                              <FaTrash className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="text-gray-500 flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-lg font-medium">No products found</p>
                      <p className="mt-1 max-w-md">
                        {searchTerm ? 
                          `No products match your search for "${searchTerm}". Try a different term.` : 
                          'You have no products yet. Add your first product to get started.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalProducts > productsPerPage && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{(currentPage - 1) * productsPerPage + 1}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * productsPerPage, totalProducts)}</span> of{' '}
            <span className="font-medium">{totalProducts}</span> products
          </div>
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FaChevronLeft className="h-4 w-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => paginate(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FaChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default DashProducts;