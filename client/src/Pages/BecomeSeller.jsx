import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/ecomLogo.png";
import { useTranslation } from "react-i18next";

const BecomeSeller = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    shopName: "",
    headquartersAddress: "",
    fiscalIdentificationCard: null,
    tradeRegister: null,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      if (files[0].type !== "application/pdf") {
        setAlert({ show: true, type: "error", message: t('seller.fileTypeError') });
        return;
      }
      if (files[0].size > 5 * 1024 * 1024) {
        setAlert({ show: true, type: "error", message: t('seller.fileSizeError') });
        return;
      }
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      await axios.post("http://localhost:8000/api/seller/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setAlert({
        show: true,
        type: "success",
        message: t('seller.successMessage'),
      });

      setFormData({
        email: "",
        shopName: "",
        headquartersAddress: "",
        fiscalIdentificationCard: null,
        tradeRegister: null,
      });

      setTimeout(() => {
        navigate("/application-status");
      }, 3000);
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err.response?.data?.message || t('seller.errorMessage'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-6">
      {alert.show && (
        <div
          className={`alert alert-${alert.type} fixed top-4 right-4 w-96 z-50 shadow-lg rounded-lg transition-all duration-300 transform ${
            alert.show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <div className="flex-1">
            <label className="text-sm">{alert.message}</label>
          </div>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setAlert({ ...alert, show: false })}
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="w-1/2 p-6">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Ecom Logo" className="h-16" />
          </div>
          <h2 className="text-xl font-bold text-center mb-3">{t('seller.title')}</h2>
          <p className="text-center text-gray-600 mb-5 text-sm">
            {t('seller.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600 text-sm">{t('seller.email')}</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('seller.emailPlaceholder')}
                className="input input-bordered w-full bg-white border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600 text-sm">{t('seller.shopName')}</span>
              </label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder={t('seller.shopNamePlaceholder')}
                className="input input-bordered w-full bg-white border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600 text-sm">{t('seller.address')}</span>
              </label>
              <input
                type="text"
                name="headquartersAddress"
                value={formData.headquartersAddress}
                onChange={handleChange}
                placeholder={t('seller.addressPlaceholder')}
                className="input input-bordered w-full bg-white border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                required
              />
            </div>

            <div className="flex gap-3">
              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text text-gray-600 text-sm">{t('seller.fiscalId')}</span>
                </label>
                <input
                  type="file"
                  name="fiscalIdentificationCard"
                  onChange={handleChange}
                  className="file-input file-input-bordered w-full bg-white border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  accept="application/pdf"
                  required
                />
              </div>
              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text text-gray-600 text-sm">{t('seller.tradeRegister')}</span>
                </label>
                <input
                  type="file"
                  name="tradeRegister"
                  onChange={handleChange}
                  className="file-input file-input-bordered w-full bg-white border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  accept="application/pdf"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full text-white font-semibold py-2 rounded-lg transition-all duration-300 text-sm ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-focus hover:shadow-lg"
              }`}
            >
              {loading ? t('seller.submitting') : t('seller.submit')}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-gray-400 text-sm">{t('seller.or')}</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="text-center">
            <p className="mb-2 text-gray-600 text-sm">{t('seller.alreadySeller')}</p>
            <button
              className="btn btn-outline w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-300 text-sm"
              onClick={() => navigate("/signin")}
            >
              {t('seller.signIn')}
            </button>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {t('seller.checkStatus')}{" "}
                <a href="/application-status" className="text-blue-500 hover:underline">
                  {t('seller.clickHere')}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="w-1/2 bg-gradient-to-r from-blue-100 to-purple-100 p-6 flex flex-col justify-center items-center">
          <ul className="steps steps-vertical">
            <li className="step step-primary">
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">{t('seller.step1')}</h3>
                <p className="text-gray-600 text-sm">{t('seller.step1Desc')}</p>
              </div>
            </li>
            <li className="step step-primary">
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">{t('seller.step2')}</h3>
                <p className="text-gray-600 text-sm">{t('seller.step2Desc')}</p>
              </div>
            </li>
            <li className="step">
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">{t('seller.step3')}</h3>
                <p className="text-gray-600 text-sm">{t('seller.step3Desc')}</p>
              </div>
            </li>
            <li className="step">
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">{t('seller.step4')}</h3>
                <p className="text-gray-600 text-sm">{t('seller.step4Desc')}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;