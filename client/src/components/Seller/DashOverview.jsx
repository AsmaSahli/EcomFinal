import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaDollarSign, 
  FaShoppingBag, 
  FaChartLine, 
  FaArrowUp, 
  FaArrowDown,
  FaExclamationTriangle,
  FaBox,
  FaSpinner
} from 'react-icons/fa';
import { FiPackage, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

const API_BASE_URL = 'http://localhost:8000/api';

const DashOverview = () => {
  const currentUser = useSelector((state) => state.user?.currentUser);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    productsCount: 0,
    revenueChange: 0,
    ordersChange: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState({
    lowStock: 0,
    outOfStock: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser?.id) {
      fetchOverviewData();
    }
  }, [currentUser]);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/orders/seller/${currentUser.id}/stats`),
        axios.get(`${API_BASE_URL}/orders/seller/${currentUser.id}/suborders`),
        axios.get(`${API_BASE_URL}/products/seller/${currentUser.id}?limit=5`)
      ]);

      // Process stats
      const { stats: backendStats } = statsRes.data;
      const { suborders } = ordersRes.data;

      // Calculate total revenue from suborders
      const totalRevenue = suborders.reduce((sum, order) => sum + order.suborder.subtotal, 0);

      // Calculate revenue change and orders change (assuming last 30 days vs previous 30 days)
      const now = new Date();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const prev30Days = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);

      const currentPeriodRevenue = suborders
        .filter(order => new Date(order.createdAt) >= last30Days)
        .reduce((sum, order) => sum + order.suborder.subtotal, 0);
      
      const previousPeriodRevenue = suborders
        .filter(order => new Date(order.createdAt) >= prev30Days && new Date(order.createdAt) < last30Days)
        .reduce((sum, order) => sum + order.suborder.subtotal, 0);

      const currentPeriodOrders = suborders
        .filter(order => new Date(order.createdAt) >= last30Days).length;
      
      const previousPeriodOrders = suborders
        .filter(order => new Date(order.createdAt) >= prev30Days && new Date(order.createdAt) < last30Days).length;

      const revenueChange = previousPeriodRevenue > 0 
        ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1)
        : 0;
      
      const ordersChange = previousPeriodOrders > 0 
        ? ((currentPeriodOrders - previousPeriodOrders) / previousPeriodOrders * 100).toFixed(1)
        : 0;

      setStats({
        totalRevenue,
        totalOrders: backendStats.totalOrders,
        pendingOrders: backendStats.pending,
        productsCount: productsRes.data.total,
        revenueChange,
        ordersChange
      });

      // Process recent orders (limit to 5)
      const formattedOrders = suborders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          id: order.orderId,
          customer: order.buyer.name,
          amount: `$${order.suborder.subtotal.toFixed(2)}`,
          status: order.suborder.status,
          date: format(new Date(order.createdAt), 'MMM d, yyyy')
        }));
      setRecentOrders(formattedOrders);

      // Process top products and inventory alerts
      let lowStockCount = 0;
      let outOfStockCount = 0;

      const formattedProducts = productsRes.data.products.map(product => {
        const sellerInfo = product.sellers[0]; // Only one seller returned due to query filter

        // Count inventory alerts
        if (sellerInfo.quantity === 0) outOfStockCount++;
        else if (sellerInfo.quantity < 10) lowStockCount++;

        return {
          id: product._id,
          name: product.name,
          image: product.images?.[0] || null,
          price: sellerInfo.unitPrice || 0,
          stock: sellerInfo.quantity || 0
        };
      });

      setTopProducts(formattedProducts);
      setInventoryAlerts({
        lowStock: lowStockCount,
        outOfStock: outOfStockCount
      });

      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      console.error('Error fetching overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {currentUser?.username || 'Seller'}!</h2>
            <p className="text-indigo-100">
              {stats.pendingOrders > 0 
                ? `You have ${stats.pendingOrders} pending orders to process` 
                : 'All orders are up to date'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/seller-dashboard?tab=add-inventory" 
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition flex items-center gap-2"
            >
              <span>Add Product</span>
            </Link>
            <Link 
              to="/seller-dashboard?tab=analytics" 
              className="bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-800 transition flex items-center gap-2"
            >
              <span>View Reports</span>
              <FaChartLine />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">${stats.totalRevenue.toFixed(2)}</p>
              <div className={`flex items-center mt-2 text-sm ${stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.revenueChange >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                {Math.abs(stats.revenueChange)}% from last period
              </div>
            </div>
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg h-12 w-12 flex items-center justify-center">
              <FaDollarSign className="text-xl" />
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
              <div className={`flex items-center mt-2 text-sm ${stats.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.ordersChange >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                {Math.abs(stats.ordersChange)}% from last period
              </div>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg h-12 w-12 flex items-center justify-center">
              <FiPackage className="text-xl" />
            </div>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold mt-1">{stats.pendingOrders}</p>
              <Link to="/seller-dashboard?tab=orders" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">
                View all orders
              </Link>
            </div>
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg h-12 w-12 flex items-center justify-center">
              <FiClock className="text-xl" />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-bold mt-1">{stats.productsCount}</p>
              <Link to="/seller-dashboard?tab=products" className="text-sm text-indigo-600 hover:underline mt-2 inline-block">
                Manage products
              </Link>
            </div>
            <div className="bg-green-100 text-green-600 p-3 rounded-lg h-12 w-12 flex items-center justify-center">
              <FaShoppingBag className="text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            <Link to="/seller-dashboard?tab=orders" className="text-sm text-indigo-600 font-medium hover:underline">
              View All
            </Link>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiPackage className="mx-auto text-4xl text-gray-300 mb-3" />
              <p className="text-gray-500">No recent orders found</p>
            </div>
          )}
        </div>

{/* Top Products */}
<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-800">Recently Added Products</h3>
    <Link to="/seller-dashboard?tab=products" className="text-sm text-indigo-600 font-medium hover:underline">
      View All
    </Link>
  </div>

  {topProducts.length > 0 ? (
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
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {topProducts.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 mr-3 rounded-lg overflow-hidden border border-gray-200">
                    {product.image ? (
                      <img className="h-full w-full object-cover" src={product.image} alt={product.name} />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <FaBox />
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {product.name.length > 30 ? `${product.name.substring(0, 30)}...` : product.name}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded-md inline-block">
                  {product.reference || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded-md">
                  {product.categoryDetails?.category?.name || 'Uncategorized'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${product.price.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.stock}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="text-center py-8">
      <FaShoppingBag className="mx-auto text-4xl text-gray-300 mb-3" />
      <p className="text-gray-500">No products found</p>
    </div>
  )}
</div>
      </div>


    </div>
  );
};

export default DashOverview;