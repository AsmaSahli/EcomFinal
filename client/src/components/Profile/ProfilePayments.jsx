import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FaCreditCard,
  FaWallet,
  FaClock,
  FaChartLine,
  FaShieldAlt,
} from "react-icons/fa";
import { MdPayments, MdSecurity } from "react-icons/md";

const ProfilePayments = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden">
        {/* Main content */}
        <div className="p-8">
          {/* Coming soon banner */}
          <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg flex items-start">
            <FaClock className="text-yellow-600 text-xl mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">
                {t("profile.payment.underDevelopment") ||
                  "Feature in Development"}
              </h3>
              <p className="text-yellow-700">
                {t("profile.payment.underDevelopmentDesc") ||
                  "Our team is working hard to bring you this feature soon."}
              </p>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {/* Secure Payments */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FaShieldAlt className="text-blue-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t("profile.payment.securePayments") || "Secure Payments"}
              </h3>
              <p className="text-gray-600">
                {t("profile.payment.securePaymentsDesc") ||
                  "Bank-level encryption to keep your transactions safe"}
              </p>
            </motion.div>

            {/* Transaction History */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FaChartLine className="text-purple-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t("profile.payment.transactionHistory") ||
                  "Transaction History"}
              </h3>
              <p className="text-gray-600">
                {t("profile.payment.transactionHistoryDesc") ||
                  "Detailed records of all your payments and transfers"}
              </p>
            </motion.div>

            {/* Multiple Methods */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FaCreditCard className="text-green-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {t("profile.payment.multipleMethods") || "Multiple Methods"}
              </h3>
              <p className="text-gray-600">
                {t("profile.payment.multipleMethodsDesc") ||
                  "Credit cards, digital wallets, and bank transfers supported"}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePayments;
