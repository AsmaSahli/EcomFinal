import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/ecomLogo.png";
import { useTranslation } from "react-i18next";

const ApplicationStatus = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const checkStatus = async () => {
    if (!email) {
      setError(t("applicationStatus.error.emptyEmail"));
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(
        `http://localhost:8000/application-status?email=${email}`
      );
      setStatus(response.data.status);

      if (response.data.status === "approved") {
        toast.success(
          <div>
            <p>{t("applicationStatus.status.approved.title")}</p>
            <p>{t("applicationStatus.status.approved.details")}</p>
          </div>,
          {
            autoClose: 5000,
            pauseOnHover: false,
          }
        );

        setTimeout(() => {
          navigate("/login");
        }, 5000);
      } else if (response.data.status === "pending") {
        toast.info(t("applicationStatus.status.pending"), {
          autoClose: 3000,
        });
      } else if (response.data.status === "rejected") {
        toast.error(
          <div>
            <p>{t("applicationStatus.status.rejected.title")}</p>
            <p>{t("applicationStatus.status.rejected.details")}</p>
          </div>,
          {
            autoClose: 5000,
          }
        );
      }
    } catch (err) {
      setError(t("applicationStatus.error.fetchError"));
      toast.error(t("applicationStatus.error.fetchError"), {
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-6">
      <ToastContainer position="top-center" />
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Ecom Logo" className="h-16" />
        </div>

        <h2 className="text-xl font-bold text-center mb-4 text-gray-800">
          {t("applicationStatus.title")}
        </h2>

        {/* Email Input */}
        <input
          type="email"
          placeholder={t("applicationStatus.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-md mb-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
        />

        {/* Check Status Button */}
        <button
          onClick={checkStatus}
          disabled={isLoading}
          className={`w-full bg-primary text-white py-2 rounded-md hover:bg-primary-focus focus:outline-none transition duration-300 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}>
          {isLoading
            ? t("applicationStatus.checkingButton")
            : t("applicationStatus.checkButton")}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {/* Application Status */}
        {status && (
          <div className="mt-4 text-center">
            <p className="text-lg text-gray-700">status : {status}</p>
            {status === "approved" && (
              <p className="text-sm text-green-600 mt-2">
                {t("applicationStatus.status.approved.redirect")}
              </p>
            )}
          </div>
        )}

        {/* Link to go back to the seller page */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {t("applicationStatus.becomeSeller.text")}{" "}
            <a href="/become-seller" className="text-blue-500 hover:underline">
              {t("applicationStatus.becomeSeller.link")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;
