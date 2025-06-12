import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaUsers, FaTimes, FaInfo, FaTrash, FaStore, FaSearch, FaBan, FaFilePdf, FaDownload, FaUndo } from "react-icons/fa";

const DashSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSellers, setTotalSellers] = useState(0);
  const [sellersPerPage, setSellersPerPage] = useState(8);
  const [showingRange, setShowingRange] = useState("");

  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [sellerToReject, setSellerToReject] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    suspended: 0
  });

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const sellersResponse = await axios.get(`http://localhost:8000/users?page=${currentPage}&limit=${sellersPerPage}&role=seller`);
        setSellers(sellersResponse.data.users);
        setTotalSellers(sellersResponse.data.total);
        setSellersPerPage(sellersResponse.data.limit);
        setShowingRange(sellersResponse.data.showing);

        const statsResponse = await axios.get("http://localhost:8000/users/sellers/stats");
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
      await axios.put(`http://localhost:8000/approve/${userId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSellers(sellers.map(seller =>
        seller._id === userId ? { ...seller, status: 'approved', isActive: true } : seller
      ));

      const statsResponse = await axios.get("http://localhost:8000/users/sellers/stats");
      setStats(statsResponse.data);

      alert('Seller approved successfully');
    } catch (error) {
      console.error('Failed to approve seller:', error);
      alert(error.response?.data?.message || 'Failed to approve seller');
    }
  };

  const openRejectModal = (sellerId) => {
    setSellerToReject(sellerId);
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectionReason("");
    setSellerToReject(null);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    try {
      await axios.put(`http://localhost:8000/reject/${sellerToReject}`, { rejectionReason: rejectionReason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSellers(sellers.map(seller =>
        seller._id === sellerToReject ? {
          ...seller,
          status: 'rejected',
          isActive: false,
          rejectionReason: rejectionReason
        } : seller
      ));

      const statsResponse = await axios.get("http://localhost:8000/users/sellers/stats");
      setStats(statsResponse.data);

      alert('Seller rejected successfully');
      closeRejectModal();
    } catch (error) {
      console.error('Failed to reject seller:', error);
      alert(error.response?.data?.message || 'Failed to reject seller');
    }
  };

  const handleDelete = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this seller?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:8000/delete/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSellers(sellers.filter(seller => seller._id !== userId));

      const statsResponse = await axios.get("http://localhost:8000/users/sellers/stats");
      setStats(statsResponse.data);

      alert("Seller deleted successfully.");
    } catch (error) {
      console.error("Failed to delete seller:", error);
      alert(error.response?.data?.message || "Failed to delete seller");
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await axios.put(`http://localhost:8000/suspend/${userId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSellers(sellers.map(seller =>
        seller._id === userId ? { ...seller, status: 'suspended', isActive: false } : seller
      ));

      const statsResponse = await axios.get("http://localhost:8000/users/sellers/stats");
      setStats(statsResponse.data);

      alert('Seller suspended successfully');
    } catch (error) {
      console.error('Failed to suspend seller:', error);
      alert(error.response?.data?.message || 'Failed to suspend seller');
    }
  };

  const handleCancelSuspension = async (userId) => {
    try {
      await axios.put(`http://localhost:8000/cancel-suspension/${userId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSellers(sellers.map(seller =>
        seller._id === userId ? { ...seller, status: 'approved', isActive: true } : seller
      ));

      const statsResponse = await axios.get("http://localhost:8000/users/sellers/stats");
      setStats(statsResponse.data);

      alert('Seller suspension canceled successfully');
    } catch (error) {
      console.error('Failed to cancel suspension:', error);
      alert(error.response?.data?.message || 'Failed to cancel suspension');
    }
  };

  const handleViewDetails = (sellerId) => {
    const seller = sellers.find(s => s._id === sellerId);
    setSelectedSeller(seller);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSeller(null);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Sellers Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <FaUsers className="text-gray-400" />
                Total Sellers
              </p>
              <h3 className="text-2xl font-bold mt-2">{stats.total}</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <FaStore className="text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <span>↑ {Math.round((stats.total / (stats.total || 1)) * 100)}%</span>
            <span className="ml-2 text-gray-500">all time</span>
          </div>
        </div>

        {/* Verified Sellers Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <FaCheck className="text-green-400" />
                Verified
              </p>
              <h3 className="text-2xl font-bold mt-2">{stats.verified}</h3>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <FaCheck className="text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-500">
            <span>↑ {Math.round((stats.verified / (stats.total || 1)) * 100)}%</span>
            <span className="ml-2 text-gray-500">of total</span>
          </div>
        </div>

        {/* Pending Approval Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <FaInfo className="text-yellow-400" />
                Pending Approval
              </p>
              <h3 className="text-2xl font-bold mt-2">{stats.pending}</h3>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <FaInfo className="text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-yellow-500">
            <span>↑ {Math.round((stats.pending / (stats.total || 1)) * 100)}%</span>
            <span className="ml-2 text-gray-500">awaiting review</span>
          </div>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sellers.map(seller => (
                <tr key={seller._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{seller.shopName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{seller.email}</td>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {/* Info button - always visible */}
                      <button
                        onClick={() => handleViewDetails(seller._id)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaInfo />
                      </button>

                      {/* Status-specific actions */}
                      {seller.status === 'rejected' ? (
                        <button
                          onClick={() => handleDelete(seller._id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      ) : (
                        <>
                          {seller.status === 'approved' && (
                            <button
                              onClick={() => handleSuspend(seller._id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                              title="Suspend"
                            >
                              <FaBan />
                            </button>
                          )}
                          {seller.status === 'suspended' && (
                            <button
                              onClick={() => handleCancelSuspension(seller._id)}
                              className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                              title="Cancel Suspension"
                            >
                              <FaUndo />
                            </button>
                          )}
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
                                onClick={() => openRejectModal(seller._id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seller Details Modal */}
      {isModalOpen && selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Popup container */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800">Seller Details</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Shop Name</label>
                    <p className="mt-1 text-gray-900">{selectedSeller.shopName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Headquarters Address</label>
                    <p className="mt-1 text-gray-900">{selectedSeller.headquartersAddress || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fiscal Identification Card</label>
                    {selectedSeller.fiscalIdentificationCard ? (
                      <a 
                        href={`http://localhost:8000/uploads/${encodeURIComponent(selectedSeller.fiscalIdentificationCard?.replace(/^.*[\\/]/, ''))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <FaFilePdf className="mr-2" />
                        View Document
                        <FaDownload className="ml-2 text-sm" />
                      </a>
                    ) : (
                      <p className="mt-1 text-gray-500">Not provided</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Trade Register</label>
                    {selectedSeller.tradeRegister ? (
                      <a 
                        href={`http://localhost:8000/uploads/${encodeURIComponent(selectedSeller.tradeRegister?.replace(/^.*[\\/]/, ''))}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <FaFilePdf className="mr-2" />
                        View Document
                        <FaDownload className="ml-2 text-sm" />
                      </a>
                    ) : (
                      <p className="mt-1 text-gray-500">Not provided</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-gray-900">{selectedSeller.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${selectedSeller.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : selectedSeller.status === 'pending' || selectedSeller.status === 'under_review'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {selectedSeller.status}
                      </span>
                    </p>
                  </div>
                </div>

                {selectedSeller.rejectionReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Rejection Reason</label>
                    <p className="mt-1 text-gray-900">{selectedSeller.rejectionReason}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-800">Reject Seller</h3>
                <button
                  onClick={closeRejectModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-700 focus:border-gray-700"
                  rows={4}
                  placeholder="Enter the reason for rejecting this seller..."
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={closeRejectModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">Showing {showingRange}</div>
        <div className="flex gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className={`px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalSellers / sellersPerPage)))}
            className={`px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 ${currentPage === Math.ceil(totalSellers / sellersPerPage) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashSellers;