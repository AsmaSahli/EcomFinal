import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaPhone, FaCar, FaSearch, FaMapMarkerAlt, FaCheck, FaTimes, FaInfo } from "react-icons/fa";

const DashDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [deliveriesPerPage, setDeliveriesPerPage] = useState(8);
  const [showingRange, setShowingRange] = useState("");
  const [stats, setStats] = useState({
    todaysDeliveries: 0,
    inProgress: 0,
    pending: 0,
    completed: 0
  });
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        // Fetch deliveries with pagination and status filter
        const deliveriesResponse = await axios.get(`http://localhost:8000/users?page=${currentPage}&limit=${deliveriesPerPage}&role=delivery`);
        console.log(deliveriesResponse.data)
        setDeliveries(deliveriesResponse.data.users);
        setTotalDeliveries(deliveriesResponse.data.total);
        setDeliveriesPerPage(deliveriesResponse.data.limit);
        setShowingRange(deliveriesResponse.data.showing);

        // Fetch stats
        const statsResponse = await axios.get("http://localhost:8000/users/deliveries/stats");
        setStats(statsResponse.data);
      } catch (err) {
        setError("Failed to fetch deliveries data");
        console.error("Failed to fetch deliveries:", err);
      }
    };

    fetchDeliveries();
  }, [currentPage, statusFilter]);

  const handleApprove = async (deliveryId) => {
    try {
      const response = await axios.put(
        `http://localhost:8000/users/${deliveryId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Update the delivery status in state
      setDeliveries(deliveries.map(delivery =>
        delivery._id === deliveryId ? { ...delivery, status: 'approved' } : delivery
      ));

      // Refresh stats
      const statsResponse = await axios.get("http://localhost:8000/users/deliveries/stats");
      setStats(statsResponse.data);

      alert('Delivery approved successfully');
    } catch (error) {
      console.error('Failed to approve delivery:', error);
      alert(error.response?.data?.message || 'Failed to approve delivery');
    }
  };

  const handleReject = async (deliveryId) => {
    const reason = prompt('Please enter the reason for rejection:');
    if (!reason) return;

    try {
      const response = await axios.put(
        `http://localhost:8000/users/${deliveryId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Update the delivery status in state
      setDeliveries(deliveries.map(delivery =>
        delivery._id === deliveryId ? { ...delivery, status: 'rejected', rejectionReason: reason } : delivery
      ));

      // Refresh stats
      const statsResponse = await axios.get("http://localhost:8000/users/deliveries/stats");
      setStats(statsResponse.data);

      alert('Delivery rejected successfully');
    } catch (error) {
      console.error('Failed to reject delivery:', error);
      alert(error.response?.data?.message || 'Failed to reject delivery');
    }
  };

  const handleViewDetails = (deliveryId) => {
    // Navigate to delivery details page or show modal
    console.log('View details for delivery:', deliveryId);
  };


  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Deliveries Management</h2>
          <p className="text-gray-600">Track and manage all delivery orders</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search deliveries..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:border-transparent"
            />
          </div>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // Reset to first page when filter changes
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Error Handling */}
      {error && <p className="text-red-600 font-medium">{error}</p>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Total Delivery Persons</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Pending Approval</div>
          <div className="text-2xl font-bold mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Approved</div>
          <div className="text-2xl font-bold mt-1">{stats.approved}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm">Rejected</div>
          <div className="text-2xl font-bold mt-1">{stats.rejected}</div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.map(person => (
                <tr key={person._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <img
                        src={person.profilePicture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      {person.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaPhone className="text-gray-400" />
                      {person.contactNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaCar className="text-blue-500" />
                      {person.vehicleType} ({person.vehicleNumber})
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-red-500" />
                      {person.deliveryArea}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${person.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : person.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {person.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {['pending', 'under_review'].includes(person.status) && (
                        <>
                          <button
                            onClick={() => handleApprove(person._id)}
                            className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleReject(person._id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleViewDetails(person._id)}
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

          {[...Array(Math.ceil(totalDeliveries / deliveriesPerPage)).keys()].map((num) => (
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
            disabled={currentPage === Math.ceil(totalDeliveries / deliveriesPerPage)}
            onClick={() =>
              setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalDeliveries / deliveriesPerPage)))
            }
            className={`px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 ${currentPage === Math.ceil(totalDeliveries / deliveriesPerPage) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Map View Button */}
      <div className="flex justify-center">
        <button className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
          <FaMapMarkerAlt />
          View Deliveries on Map
        </button>
      </div>
    </div>
  );
};

export default DashDeliveries;