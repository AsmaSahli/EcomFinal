import React from "react";
import { Link } from "react-router-dom";
import { 
  FaDollarSign, 
  FaShoppingBag, 
  FaUsers, 
  FaChartPie, 
  FaArrowUp, 
  FaArrowDown,
  FaStar,
  FaExclamationTriangle,
  FaBox
} from "react-icons/fa";

const DashOverview = ({ stats, recentOrders, topProducts, salesData, username }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#3F0AAD] to-[#5E1ED1] text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {username}!</h2>
            <p className="text-purple-100">You have {stats.orders} orders to process today</p>
          </div>
          <button className="bg-white text-[#3F0AAD] px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition">
            View Reports
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">{stats.revenue}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaDollarSign className="text-[#3F0AAD]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <FaArrowUp className="mr-1" />
            <span>12.5%</span>
            <span className="ml-2 text-gray-500">vs last month</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold mt-1">{stats.orders}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaShoppingBag className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <FaArrowUp className="mr-1" />
            <span>8.2%</span>
            <span className="ml-2 text-gray-500">vs last month</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">New Customers</p>
              <h3 className="text-2xl font-bold mt-1">{stats.newCustomers}</h3>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <FaUsers className="text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <FaArrowUp className="mr-1" />
            <span>5.7%</span>
            <span className="ml-2 text-gray-500">vs last month</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <h3 className="text-2xl font-bold mt-1">{stats.conversionRate}%</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FaChartPie className="text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-500">
            <FaArrowDown className="mr-1" />
            <span>1.1%</span>
            <span className="ml-2 text-gray-500">vs last month</span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
          <Link to="/seller-dashboard?tab=orders" className="text-sm text-[#3F0AAD] font-medium hover:underline">
            View All Orders
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : order.status === 'processing' 
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'shipped'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link 
                      to={`/seller-dashboard?tab=orders&order=${order.id}`}
                      className="text-[#3F0AAD] hover:text-[#2D077A] font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Top Selling Products</h3>
            <Link to="/seller-dashboard?tab=products" className="text-sm text-[#3F0AAD] font-medium hover:underline">
              View All Products
            </Link>
          </div>
          
          <div className="space-y-4">
            {topProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <div className="flex items-center mt-1">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-500">{product.rating}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{product.sales} sales</div>
                  <div className={`text-xs ${
                    product.stock < 10 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {product.stock} in stock
                    {product.stock < 10 && (
                      <FaExclamationTriangle className="ml-1 inline" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Weekly Sales</h3>
            <Link to="/seller-dashboard?tab=analytics" className="text-sm text-[#3F0AAD] font-medium hover:underline">
              View Details
            </Link>
          </div>
          
          <div className="h-64 flex items-end space-x-2">
            {salesData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-purple-100 rounded-t hover:bg-[#3F0AAD] transition-all duration-300"
                  style={{ height: `${day.sales * 5}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{day.day}</span>
                <span className="text-xs font-medium">{day.sales}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Inventory Alerts</h3>
          <Link to="/seller-dashboard?tab=products" className="text-sm text-[#3F0AAD] font-medium hover:underline">
            Manage Inventory
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="border border-red-100 bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-2" />
              <span className="font-medium">5 products</span>
            </div>
            <p className="text-sm text-red-600 mt-1">Low stock (less than 10)</p>
          </div>
          
          <div className="border border-yellow-100 bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-yellow-500 mr-2" />
              <span className="font-medium">2 products</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">Out of stock</p>
          </div>
          
          <div className="border border-blue-100 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FaBox className="text-blue-500 mr-2" />
              <span className="font-medium">12 products</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">Need restocking soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashOverview;