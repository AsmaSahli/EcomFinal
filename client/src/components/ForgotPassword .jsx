import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8000/forgot-password", { email });
      toast.success(t("forgotPassword.success"));
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || t("forgotPassword.error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
      <div 
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100"
        dir={t('dir')}
      >
        <h2 className="text-2xl font-bold text-center mb-4">
          {t("forgotPassword.title")}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          {t("forgotPassword.subtitle")}
        </p>

        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text text-gray-600">
              {t("forgotPassword.emailLabel")}
            </span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("forgotPassword.emailPlaceholder")}
            className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          onClick={handleForgotPassword}
          className="btn btn-primary w-full mb-4 text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:bg-primary-focus"
        >
          {t("forgotPassword.submitButton")}
        </button>

        <div className="text-center">
          <Link
            to="/login"
            className="btn btn-outline w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900"
          >
            {t("forgotPassword.backButton")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;