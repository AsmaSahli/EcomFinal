// Create src/components/Admin/ReportModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { FaFileAlt, FaSpinner, FaDownload, FaTimes } from 'react-icons/fa';

const ReportModal = ({ onClose, stats, recentBuyers, recentSellers, recentDeliveries }) => {
  const [report, setReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Combine all recent users with null checks
      const allRecentUsers = [
        ...(recentBuyers || []).map(u => ({ 
          ...u, 
          role: 'buyer',
          name: u.name || 'N/A',
          email: u.email || 'N/A',
          status: u.isActive ? 'active' : 'inactive'
        })),
        ...(recentSellers || []).map(u => ({ 
          ...u, 
          role: 'seller',
          name: u.shopName || u.name || 'N/A',
          email: u.email || 'N/A',
          status: u.isActive ? 'active' : 'inactive'
        })),
        ...(recentDeliveries || []).map(u => ({ 
          ...u, 
          role: 'delivery',
          name: u.name || 'N/A',
          email: u.email || 'N/A',
          status: u.isActive ? 'active' : 'inactive'
        }))
      ];

      const response = await axios.post('http://localhost:8000/generate-report', {
        stats: stats || {},
        recentUsers: allRecentUsers
      }, {
        timeout: 30000
      });
      
      if (response.data.success) {
        setReport(response.data.report);
      } else {
        throw new Error(response.data.message || "Failed to generate report");
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error.response?.data?.message || error.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
};

  const downloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([report], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `admin-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-xl font-bold text-gray-800">Generate Report</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {report ? (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br />') }} />
            </div>
          ) : (
            <div className="text-center py-8">
              <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-700">No report generated yet</h4>
              <p className="text-gray-500 mt-2">
                Click the button below to generate an AI-powered report of your dashboard data
              </p>
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          
          {report ? (
            <button
              onClick={downloadReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaDownload /> Download Report
            </button>
          ) : (
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
                isGenerating ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FaFileAlt /> Generate Report
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;