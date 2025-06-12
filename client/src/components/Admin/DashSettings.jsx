import React, { useState } from 'react';
import { FaCog, FaDatabase, FaPalette, FaTools } from 'react-icons/fa';

const DashSettings = () => {
  const [activeTab, setActiveTab] = useState('language');
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Maintenance Banner */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
        <div className="flex items-center">
          <FaTools className="text-yellow-500 mr-2" />
          <div>
            <p className="font-bold text-yellow-800">Maintenance Mode</p>
            <p className="text-yellow-700">Settings are currently unavailable while we perform system maintenance.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('language')}
          className={`px-4 py-2 font-medium ${activeTab === 'language' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          
        >
          Language
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 font-medium ${activeTab === 'appearance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          
        >
          Appearance
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 font-medium ${activeTab === 'data' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          
        >
          Data Management
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'language' && (
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <FaCog className="mr-2 text-gray-400" />
              Language Settings
            </h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-500 mb-2">Select Language</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-gray-500 italic">Language selection is currently disabled during maintenance.</p>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <FaPalette className="mr-2 text-gray-400" />
              Appearance Settings
            </h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-500 mb-2">Theme</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled
                >
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-500 mb-2">Font Size</label>
                <input 
                  type="range" 
                  min="12" 
                  max="18" 
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed" 
                  disabled
                />
              </div>
              <p className="text-sm text-gray-500 italic">Appearance settings are currently disabled during maintenance.</p>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <FaDatabase className="mr-2 text-gray-400" />
              Data Management
            </h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-500 mb-2">Auto-delete Inactive Users</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                  disabled
                >
                  <option>Never</option>
                  <option>After 6 months</option>
                  <option>After 1 year</option>
                  <option>After 2 years</option>
                </select>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Enable Data Export</label>
                    <p className="text-xs text-gray-400">Allow administrators to export user data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-not-allowed">
                    <input type="checkbox" className="sr-only" disabled />
                    <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-500 italic">Data management features are currently disabled during maintenance.</p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            className="px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
            disabled
          >
            Save Changes (Disabled)
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashSettings;