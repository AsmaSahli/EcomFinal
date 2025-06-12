import React from 'react';
import MetabaseDashboard from '../MetabaseDashboard';
import { useSelector } from 'react-redux';
import { FaTools } from 'react-icons/fa';

const ALLOWED_USER_ID = "67e5ca9fe4b30f5e1dd28e3a";

const DashAnalytics = () => {
  const currentUser = useSelector((state) => state.user?.currentUser);
  console.log('Current User:', currentUser);
  console.log('User ID:', currentUser?.id);
  console.log('Allowed ID:', ALLOWED_USER_ID);
  console.log('Condition Result:', !currentUser || currentUser.id.toString() !== ALLOWED_USER_ID);
  
  if (currentUser?.id !== ALLOWED_USER_ID) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-center">
            <FaTools className="text-yellow-500 mr-2" />
            <div>
              <p className="font-bold text-yellow-800">Maintenance Mode</p>
              <p className="text-yellow-700">Anlytics Dashboard are currently unavailable while we perform system maintenance.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Analytics</h2>
            <p className="text-gray-600">Powered by Metabase</p>
          </div>
        </div>
        <MetabaseDashboard dashboardId="4" /> 
      </div>
    </div>
  );
};

export default DashAnalytics;