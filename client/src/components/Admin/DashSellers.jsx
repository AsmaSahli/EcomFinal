import React from "react";
import { Link } from "react-router-dom";
import { FaStore, FaChartLine, FaSearch, FaPlus, FaEdit, FaBan } from "react-icons/fa";

const DashSellers = () => {
  // Mock sellers data
  const sellers = [
    { id: 1, name: "Tech Gadgets", owner: "Alex Johnson", products: 42, status: "verified", revenue: "$12,450" },
    { id: 2, name: "Fashion Hub", owner: "Sarah Williams", products: 28, status: "verified", revenue: "$8,720" },
    { id: 3, name: "Home Essentials", owner: "Mike Chen", products: 15, status: "pending", revenue: "$3,210" },
    { id: 4, name: "Book World", owner: "Emma Davis", products: 37, status: "verified", revenue: "$5,890" },
    { id: 5, name: "Sports Gear", owner: "James Wilson", products: 19, status: "suspended", revenue: "$2,340" },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sellers Management</h2>
          <p className="text-gray-600">Manage all sellers and their stores</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sellers..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent"
            />
          </div>
          <Link 
            to="/admin/sellers/new"
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            <FaPlus />
            Add Seller
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Total Sellers</div>
          <div className="text-2xl font-bold mt-1">24</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Verified</div>
          <div className="text-2xl font-bold mt-1">18</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Pending</div>
          <div className="text-2xl font-bold mt-1">4</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Suspended</div>
          <div className="text-2xl font-bold mt-1">2</div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sellers.map(seller => (
                <tr key={seller.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{seller.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{seller.owner}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{seller.products}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      seller.status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : seller.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {seller.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{seller.revenue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                        <FaEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                        <FaBan />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50">
                        <FaChartLine />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashSellers;