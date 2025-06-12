import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FaLanguage, FaMoon, FaSun, FaPalette } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

const ProfileSettings = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("general");
  const [languageOpen, setLanguageOpen] = useState(false);

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguageOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-lg">
                <IoSettingsSharp className="text-3xl" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1">Account Settings</h1>
              <p className="text-blue-100">Customize your experience</p>
              <div className="mt-2 flex justify-center md:justify-start gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                  Personalization
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-56">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("general")}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === "general"
                      ? "bg-blue-100 text-blue-600 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}>
                  <IoSettingsSharp className="text-lg" />
                  <span>General</span>
                </button>
                <button
                  onClick={() => setActiveTab("appearance")}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === "appearance"
                      ? "bg-blue-100 text-blue-600 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}>
                  <FaPalette className="text-lg" />
                  <span>Appearance</span>
                </button>
              </nav>
            </div>

            {/* Main Content - Added min-height here */}
            <div className="flex-1 min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === "general" && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <IoSettingsSharp className="text-blue-500" />
                      General Settings
                    </h2>

                    {/* Language Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setLanguageOpen(!languageOpen)}
                        className="w-full p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FaLanguage className="text-blue-500" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-gray-800">
                              Language
                            </h3>
                            <p className="text-sm text-gray-500">
                              {
                                languages.find((l) => l.code === i18n.language)
                                  ?.name
                              }
                            </p>
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            languageOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {languageOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                          {languages.map((language) => (
                            <button
                              key={language.code}
                              onClick={() => changeLanguage(language.code)}
                              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                                i18n.language === language.code
                                  ? "bg-blue-100 text-blue-600"
                                  : "text-gray-800"
                              }`}>
                              <span className="text-xl">{language.flag}</span>
                              <span>{language.name}</span>
                              {i18n.language === language.code && (
                                <span className="ml-auto text-blue-500">✓</span>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "appearance" && (
                  <motion.div
                    key="appearance"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                      <FaPalette className="text-blue-500" />
                      Appearance
                    </h2>

                    {/* Dark Mode Toggle - Disabled */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FaMoon className="text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">
                              Dark Mode
                            </h3>
                            <p className="text-sm text-gray-500">Coming soon</p>
                          </div>
                        </div>
                        <button
                          disabled
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none bg-gray-200 cursor-not-allowed`}>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1`}
                          />
                        </button>
                      </div>
                    </motion.div>

                    {/* Theme Color - Coming Soon */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FaPalette className="text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            Theme Color
                          </h3>
                          <p className="text-sm text-gray-500">Coming soon</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileSettings;
