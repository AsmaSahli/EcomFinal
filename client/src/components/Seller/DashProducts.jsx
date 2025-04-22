import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaEdit, 
  FaTrash, 
  FaBoxOpen, 
  FaStar,
  FaExclamationTriangle
} from 'react-icons/fa';

const DashProducts = () => {
  // Sample product data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      category: 'Electronics',
      price: 89.99,
      stock: 45,
      sales: 124,
      rating: 4.5,
      status: 'published',
      image: 'https://via.placeholder.com/60'
    },
    {
      id: 2,
      name: 'Organic Cotton T-Shirt',
      category: 'Apparel',
      price: 24.99,
      stock: 3,
      sales: 89,
      rating: 4.2,
      status: 'low stock',
      image: 'https://via.placeholder.com/60'
    },
    {
      id: 3,
      name: 'Stainless Steel Water Bottle',
      category: 'Home',
      price: 19.99,
      stock: 0,
      sales: 156,
      rating: 4.8,
      status: 'out of stock',
      image: 'https://via.placeholder.com/60'
    },
    {
      id: 4,
      name: 'Yoga Mat',
      category: 'Fitness',
      price: 29.99,
      stock: 32,
      sales: 72,
      rating: 4.1,
      status: 'published',
      image: 'https://via.placeholder.com/60'
    },
    {
      id: 5,
      name: 'Smart Watch',
      category: 'Electronics',
      price: 199.99,
      stock: 15,
      sales: 43,
      rating: 4.6,
      status: 'published',
      image: 'https://via.placeholder.com/60'
    },
  ]);

  // Delete product
  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Product Management</h1>
        <Link 
          to="/seller-dashboard?tab=add-inventory"
          className="bg-[#3F0AAD] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#2D077A] transition"
        >
          Add New Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length > 0 ? (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded" src={product.image} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        {product.rating}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : product.status === 'low stock' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/seller-dashboard/edit-product/${product.id}`}
                          className="text-[#3F0AAD] hover:text-[#2D077A]"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg mr-4">
            <FaBoxOpen className="text-[#3F0AAD]" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <h3 className="text-xl font-bold">{products.length}</h3>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
          <div className="bg-yellow-100 p-3 rounded-lg mr-4">
            <FaExclamationTriangle className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock</p>
            <h3 className="text-xl font-bold">{products.filter(p => p.status === 'low stock').length}</h3>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center">
          <div className="bg-red-100 p-3 rounded-lg mr-4">
            <FaExclamationTriangle className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Out of Stock</p>
            <h3 className="text-xl font-bold">{products.filter(p => p.status === 'out of stock').length}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashProducts;