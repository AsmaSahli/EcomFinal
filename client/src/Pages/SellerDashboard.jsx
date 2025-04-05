import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaHome, 
  FaBox, 
  FaClipboardList, 
  FaCog, 
  FaSignOutAlt, 
  FaChartPie,
  FaUserCircle,
  FaBell,
  FaSearch,
  FaShoppingBag,
  FaDollarSign,
  FaUsers,
  FaComments,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { signoutSuccess } from '../redux/user/userSlice';

const SellerDashboard = () => {
  const currentUser = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      await axios.post('http://localhost:8000/signout');
      dispatch(signoutSuccess());
      navigate("/");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Mock data
  const stats = {
    revenue: "$12,345",
    orders: 150,
    newCustomers: 24,
    conversionRate: 3.2,
    products: 68,
    messages: 3
  };

  const recentOrders = [
    { id: 1001, customer: "Alex Johnson", amount: "$120", status: "completed", date: "10 min ago" },
    { id: 1002, customer: "Sarah Williams", amount: "$85", status: "processing", date: "25 min ago" },
    { id: 1003, customer: "Mike Chen", amount: "$230", status: "shipped", date: "1 hour ago" },
    { id: 1004, customer: "Emily Davis", amount: "$65", status: "pending", date: "2 hours ago" }
  ];

  const topProducts = [
    { id: 1, name: "Wireless Headphones", sales: 45, stock: 12, rating: 4.8 },
    { id: 2, name: "Smart Watch", sales: 32, stock: 5, rating: 4.5 },
    { id: 3, name: "Bluetooth Speaker", sales: 28, stock: 18, rating: 4.2 }
  ];

  const salesData = [
    { day: "Mon", sales: 12 },
    { day: "Tue", sales: 19 },
    { day: "Wed", sales: 8 },
    { day: "Thu", sales: 15 },
    { day: "Fri", sales: 22 },
    { day: "Sat", sales: 18 },
    { day: "Sun", sales: 14 }
  ];

  const username = currentUser?.email.split('@')[0] || 'Seller';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#3F0AAD] to-[#2D077A] text-white flex flex-col p-0 shadow-xl">
        {/* Sidebar Header */}
        <div className="p-6 pb-4 border-b border-[#4A12C4]">
          <div className="flex items-center space-x-3">
            <FaShoppingBag className="text-2xl text-purple-300" />
            <h1 className="text-xl font-bold">Seller Hub</h1>
          </div>
          <div className="mt-4 text-sm text-purple-200">
            Welcome back, <span className="font-medium text-white">{username}</span>
          </div>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link to="/seller-dashboard" className="flex items-center px-4 py-3 rounded-lg bg-[#4A12C4] text-white font-medium">
                <FaHome className="mr-3 text-purple-200" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/products" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaBox className="mr-3 text-purple-200" />
                Products
                <span className="ml-auto bg-[#4A12C4] text-xs font-semibold px-2 py-1 rounded-full">
                  {stats.products}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/orders" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaClipboardList className="mr-3 text-purple-200" />
                Orders
                <span className="ml-auto bg-[#4A12C4] text-xs font-semibold px-2 py-1 rounded-full">
                  {stats.orders}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/customers" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaUsers className="mr-3 text-purple-200" />
                Customers
              </Link>
            </li>
            <li>
              <Link to="/sales" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaDollarSign className="mr-3 text-purple-200" />
                Sales
              </Link>
            </li>
            <li>
              <Link to="/messages" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaComments className="mr-3 text-purple-200" />
                Messages
                <span className="ml-auto bg-red-500 text-xs font-semibold px-2 py-1 rounded-full">
                  {stats.messages}
                </span>
              </Link>
            </li>
            <li>
              <Link to="/analytics" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaChartPie className="mr-3 text-purple-200" />
                Analytics
              </Link>
            </li>
            <li>
              <Link to="/settings" className="flex items-center px-4 py-3 rounded-lg hover:bg-[#4A12C4] hover:text-white transition">
                <FaCog className="mr-3 text-purple-200" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#4A12C4]">
          <button 
            onClick={signOut}
            className="flex items-center w-full px-4 py-2 text-sm text-purple-200 hover:text-white rounded-lg hover:bg-[#4A12C4] transition"
          >
            <FaSignOutAlt className="mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Search Bar */}
            <div className="relative w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, orders..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3F0AAD] focus:border-transparent"
              />
            </div>
            
            {/* User Info and Notifications */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                <FaBell className="text-xl" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="text-right hidden md:block">
                  <div className="font-medium text-gray-800">{username}</div>
                  <div className="text-xs text-gray-500">Premium Seller</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FaUserCircle className="text-2xl text-[#3F0AAD]" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
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
              <Link to="/orders" className="text-sm text-[#3F0AAD] font-medium hover:underline">
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
                        <button className="text-[#3F0AAD] hover:text-[#2D077A] font-medium">
                          View
                        </button>
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
                <Link to="/products" className="text-sm text-[#3F0AAD] font-medium hover:underline">
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
                <button className="text-sm text-[#3F0AAD] font-medium hover:underline">
                  View Details
                </button>
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
              <button className="text-sm text-[#3F0AAD] font-medium hover:underline">
                Manage Inventory
              </button>
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
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;