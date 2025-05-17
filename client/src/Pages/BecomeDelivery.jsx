import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/ecomLogo.png";
import deliveryIllustration from "../assets/deliveryIllustration.png";
import { useTranslation } from "react-i18next";

const BecomeDelivery = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    vehicleType: "",
    vehicleNumber: "",
    deliveryArea: "",
    contactNumber: "",
    cv: null,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "contactNumber") {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length > 8) return;
      setFormData({ ...formData, [name]: `+216${numericValue}` });
      return;
    }
    
    if (files) {
      if (files[0].type !== "application/pdf") {
        setAlert({ show: true, type: "error", message: t('delivery.fileTypeError') });
        return;
      }
      if (files[0].size > 5 * 1024 * 1024) {
        setAlert({ show: true, type: "error", message: t('delivery.fileSizeError') });
        return;
      }
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.contactNumber.length !== 12) {
      setAlert({ 
        show: true, 
        type: "error", 
        message: t('delivery.phoneError') 
      });
      return;
    }
    
    setLoading(true);

    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      await axios.post("http://localhost:8000/api/delivery/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setAlert({
        show: true,
        type: "success",
        message: t('delivery.successMessage'),
      });

      setFormData({
        email: "",
        vehicleType: "",
        vehicleNumber: "",
        deliveryArea: "",
        contactNumber: "",
        cv: null,
      });
      navigate("/application-status");
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err.response?.data?.message || t('delivery.errorMessage'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-6">
      {alert.show && (
        <div className={`fixed top-4 right-4 w-96 z-50 alert ${
          alert.type === "error" ? "alert-error" : "alert-success"
        }`}>
          <div className="flex-1">
            <label>{alert.message}</label>
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
        <div className="w-1/2 p-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Ecom Logo" className="h-16" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            {t('delivery.title')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600">{t('delivery.email')}</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('delivery.emailPlaceholder')}
                className="input input-bordered w-full bg-white border-gray-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-600">{t('delivery.vehicleType')}</span>
                </label>
                <input
                  type="text"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  placeholder={t('delivery.vehicleTypePlaceholder')}
                  className="input input-bordered w-full bg-white border-gray-200"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-600">{t('delivery.vehicleNumber')}</span>
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder={t('delivery.vehicleNumberPlaceholder')}
                  className="input input-bordered w-full bg-white border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600">{t('delivery.deliveryArea')}</span>
              </label>
              <input
                type="text"
                name="deliveryArea"
                value={formData.deliveryArea}
                onChange={handleChange}
                placeholder={t('delivery.deliveryAreaPlaceholder')}
                className="input input-bordered w-full bg-white border-gray-200"
                required
              />
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text text-gray-600">{t('delivery.contactNumber')}</span>
                </label>
                <div className="flex items-stretch">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-white text-gray-600 text-sm">
                    +216
                    </span>
                    <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber.replace('+216', '')}
                    onChange={handleChange}
                    placeholder={t('delivery.contactNumberPlaceholder')}
                    className="flex-1 input rounded-r-lg border-l-0 border-gray-300 bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                    maxLength={8}
                    required
                    />
                </div>
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  {t('delivery.phoneHint')}
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600">{t('delivery.cv')}</span>
              </label>
              <input
                type="file"
                name="cv"
                onChange={handleChange}
                className="file-input file-input-bordered w-full bg-white border-gray-200"
                accept=".pdf"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full mt-6 ${
                loading ? "loading" : ""
              }`}
            >
              {loading ? t('delivery.submitting') : t('delivery.submit')}
            </button>
          </form>
          <div className="mt-4">
                <p className="text-sm text-gray-600">
                {t('delivery.checkStatus')}{" "}
                <a
                    href="/application-status"
                    className="text-blue-500 hover:underline"
                >
                    {t('delivery.clickHere')}
                </a>
                </p>
            </div>
        </div>

        <div className="w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-white"></div>
          </div>
          
          <div className="relative z-10 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">{t('delivery.benefitsTitle')}</h2>
            <p className="text-lg mb-8 max-w-md">
              {t('delivery.benefitsSubtitle')}
            </p>
            
            <div className="w-3/4 mx-auto">
              <img 
                src={deliveryIllustration} 
                alt="Delivery Person" 
                className="w-full animate-float" 
              />
            </div>
            
            <div className="mt-8 space-y-2 text-indigo-100">
              <p className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {t('delivery.benefit1')}
              </p>
              <p className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {t('delivery.benefit2')}
              </p>
              <p className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {t('delivery.benefit3')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeDelivery;