import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaCheck, FaTimes,FaInfo , FaStore, FaChartLine, FaSearch, FaPlus, FaEdit, FaBan } from "react-icons/fa";

const DashSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSellers, setTotalSellers] = useState(0);
  const [sellersPerPage, setSellersPerPage] = useState(8);
  const [showingRange, setShowingRange] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    suspended: 0
  });

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        // Fetch sellers with pagination
        const sellersResponse = await axios.get(`http://localhost:8000/users?page=${currentPage}&limit=${sellersPerPage}&role=seller`);
        console.log(sellersResponse.data)
        setSellers(sellersResponse.data.users);
        setTotalSellers(sellersResponse.data.total);
        setSellersPerPage(sellersResponse.data.limit);
        setShowingRange(sellersResponse.data.showing);

        // Fetch stats (you'll need to create this endpoint)
        const statsResponse = await axios.get("http://localhost:8000/users/sellers/stats");
        console.log(statsResponse.data)
        setStats(statsResponse.data);
      } catch (err) {
        setError("Failed to fetch sellers data");
        console.error("Failed to fetch sellers:", err);
      }
    };

    fetchSellers();
  }, [currentPage]);

  const handleApprove = async (userId) => {
    try {
      const response = await axios.put(
        `http://localhost:8000/users/${userId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Update the seller in state
      setSellers(sellers.map(seller =>
        seller._id === userId ? { ...seller, status: 'approved', isActive: true } : seller
      ));

      // Refresh stats
      const statsResponse = await axios.get("http://localhost:8000/users/sellers/stats");
      setStats(statsResponse.data);

      alert('Seller approved successfully');
    } catch (error) {
      console.error('Failed to approve seller:', error);
      alert(error.response?.data?.message || 'Failed to approve seller');
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt('Please enter the reason for rejection:');
    if (!reason) return;

    try {
      const response = await axios.put(
        `http://localhost:8000/users/${userId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Update the seller in state
      setSellers(sellers.map(seller =>
        seller._id === userId ? {
          ...seller,
          status: 'rejected',
          isActive: false,
          rejectionReason: reason
        } : seller
      ));

      // Refresh stats
      const statsResponse = await axios.get("http://localhost:8000/users/sellers/stats");
      setStats(statsResponse.data);

      alert('Seller rejected successfully');
    } catch (error) {
      console.error('Failed to reject seller:', error);
      alert(error.response?.data?.message || 'Failed to reject seller');
    }
  };

  const handleViewDetails = (userId) => {
    // Navigate to user details page or show modal
    console.log('View details for user:', userId);
  };

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
        </div>
      </div>

      {/* Error Handling */}
      {error && <p className="text-red-600 font-medium">{error}</p>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Total Sellers</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Verified</div>
          <div className="text-2xl font-bold mt-1">{stats.verified}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Pending</div>
          <div className="text-2xl font-bold mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Suspended</div>
          <div className="text-2xl font-bold mt-1">{stats.suspended}</div>
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
                <tr key={seller._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{seller.shopName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{seller.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{seller.productsCount || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${seller.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : seller.status === 'pending' || seller.status === 'under_review'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {seller.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">${seller.revenue || 0}</td>
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
                    <div className="flex gap-2">
                      {['pending', 'under_review'].includes(seller.status) && (
                        <>
                          <button
                            onClick={() => handleApprove(seller._id)}
                            className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleReject(seller._id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleViewDetails(seller._id)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaInfo />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {showingRange}
        </div>

        <div className="flex gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className={`px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            Previous
          </button>

          {[...Array(Math.ceil(totalSellers / sellersPerPage)).keys()].map((num) => (
            <button
              key={num + 1}
              onClick={() => setCurrentPage(num + 1)}
              className={`px-3 py-1 rounded ${currentPage === num + 1
                ? 'bg-gray-800 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
            >
              {num + 1}
            </button>
          ))}

          <button
            disabled={currentPage === Math.ceil(totalSellers / sellersPerPage)}
            onClick={() =>
              setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalSellers / sellersPerPage)))
            }
            className={`px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 ${currentPage === Math.ceil(totalSellers / sellersPerPage) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashSellers;