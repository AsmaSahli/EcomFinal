import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaEnvelope, FaTools, FaRegSadTear } from 'react-icons/fa';
import { MdOutlineEmail, MdOutlineSupportAgent } from 'react-icons/md';

const ProfileMessages = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg overflow-hidden">
        {/* Header with illustration */}
        <div className="bg-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-b border-gray-100">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FaRegSadTear className="text-purple-600 text-3xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('profile.messages.serviceUnavailable')}
            </h2>
            <p className="text-gray-600">
              {t('profile.messages.serviceUnavailableDesc')}
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 md:p-8">
          {/* Service status card */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <FaTools className="text-yellow-500 text-xl" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">
                  {t('profile.messages.underMaintenance')}
                </h3>
                <p className="text-yellow-700 mt-1">
                  {t('profile.messages.underMaintenanceDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Email contact option */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <MdOutlineEmail className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {t('profile.messages.emailUs')}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t('profile.messages.emailUsDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <a 
                href="mailto:elctsyservice@gmail.com" 
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
              >
                <FaEnvelope className="mr-3" />
                <span className="font-medium">elctsyserviceteam@gmail.com</span>
              </a>
              <p className="text-sm text-gray-500 sm:ml-4">
                {t('profile.messages.responseTime') || "We typically respond within 24 hours"}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default ProfileMessages;