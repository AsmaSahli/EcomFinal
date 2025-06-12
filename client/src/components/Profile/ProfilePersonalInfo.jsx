import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaLock,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import axios from "axios";

const ProfilePersonalInfo = () => {
  const { t } = useTranslation();
  const currentUser = useSelector((state) => state.user?.currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phoneNumber: currentUser?.phoneNumber || "",
    address: currentUser?.address || "",
    password: "",
    newPassword: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.put(
        `http://localhost:8000/user/${currentUser.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }
      );
      setSuccess(response.data.message);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={
                  currentUser?.profilePicture ||
                  "https://via.placeholder.com/150"
                }
                alt={currentUser?.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors">
                <FaEdit className="text-purple-600" />
              </button>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1">
                {currentUser?.name || t("profile.user")}
              </h1>
              <p className="text-blue-100">{currentUser?.email}</p>
              <div className="mt-2 flex justify-center md:justify-start gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                  Joined {new Date(currentUser?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaUser className="text-blue-500" />
            {t("profile.personalInfo")}
          </h2>

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <InfoCard
                  icon={<FaUser className="text-blue-500" />}
                  title={t("profile.name")}
                  value={formData.name}
                  editable={isEditing}
                  name="name"
                  onChange={handleInputChange}
                />
                <InfoCard
                  icon={<FaPhone className="text-blue-500" />}
                  title={t("profile.phone")}
                  value={formData.phoneNumber}
                  editable={isEditing}
                  name="phoneNumber"
                  onChange={handleInputChange}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <InfoCard
                  icon={<FaEnvelope className="text-blue-500" />}
                  title={t("profile.email")}
                  value={formData.email}
                  protected
                />
                <InfoCard
                  icon={<FaMapMarkerAlt className="text-blue-500" />}
                  title={t("profile.address")}
                  value={formData.address}
                  editable={isEditing}
                  name="address"
                  onChange={handleInputChange}
                />
                {isEditing && (
                  <>
                    <InfoCard
                      icon={<FaLock className="text-blue-500" />}
                      title={t("profile.currentPassword")}
                      value={formData.password}
                      editable={isEditing}
                      name="password"
                      type="password"
                      onChange={handleInputChange}
                    />
                    <InfoCard
                      icon={<FaLock className="text-blue-500" />}
                      title={t("profile.newPassword")}
                      value={formData.newPassword}
                      editable={isEditing}
                      name="newPassword"
                      type="password"
                      onChange={handleInputChange}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Edit Mode Actions */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  {t("profile.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  {t("profile.saveChanges")}
                </button>
              </motion.div>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
};

// Reusable Info Card Component
const InfoCard = ({
  icon,
  title,
  value,
  editable = false,
  name,
  type = "text",
  onChange,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="mt-1 flex items-center gap-2">
            {editable ? (
              <input
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800">{value || "N/A"}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePersonalInfo;
