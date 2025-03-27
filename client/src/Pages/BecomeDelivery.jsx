import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/ecomLogo.png";
import deliveryIllustration from "../assets/deliveryIllustration.png";

const BecomeDelivery = () => {
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
      // Only allow numbers and automatically add +216 if not present
      const numericValue = value.replace(/\D/g, '');
      
      // Limit to 8 digits after +216
      if (numericValue.length > 8) return;
      
      setFormData({ 
        ...formData, 
        [name]: `+216${numericValue}` 
      });
      return;
    }
    
    if (files) {
      if (files[0].type !== "application/pdf") {
        setAlert({ show: true, type: "error", message: "Please upload a PDF file." });
        return;
      }
      if (files[0].size > 5 * 1024 * 1024) {
        setAlert({ show: true, type: "error", message: "File size must be less than 5MB." });
        return;
      }
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation for Tunisian phone number
    if (formData.contactNumber.length !== 12) { // +216 + 8 digits
      setAlert({ 
        show: true, 
        type: "error", 
        message: "Please enter a valid 8-digit Tunisian phone number" 
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
        message: "Application submitted successfully! We'll review your request soon.",
      });

      setFormData({
        email: "",
        vehicleType: "",
        vehicleNumber: "",
        deliveryArea: "",
        contactNumber: "",
        cv: null,
      });
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Something went wrong!",
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
        {/* Left Form Section */}
        <div className="w-1/2 p-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Ecom Logo" className="h-16" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Join Our Delivery Team
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="input input-bordered w-full bg-white border-gray-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-600">Vehicle Type</span>
                </label>
                <input
                  type="text"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  placeholder="Car, Bike, etc."
                  className="input input-bordered w-full bg-white border-gray-200"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-600">Vehicle Number</span>
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="e.g. TN 1234"
                  className="input input-bordered w-full bg-white border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600">Delivery Area</span>
              </label>
              <input
                type="text"
                name="deliveryArea"
                value={formData.deliveryArea}
                onChange={handleChange}
                placeholder="Your working area"
                className="input input-bordered w-full bg-white border-gray-200"
                required
              />
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text text-gray-600">Contact Number</span>
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
                    placeholder="20 123 456"
                    className="flex-1 input rounded-r-lg border-l-0 border-gray-300 bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                    maxLength={8}
                    required
                    />
                </div>
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  Enter your 8-digit Tunisian number
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600">Your CV (PDF)</span>
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
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>

        {/* Right Design Section */}
        <div className="w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white"></div>
            <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-white"></div>
          </div>
          
          <div className="relative z-10 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Deliver With Us</h2>
            <p className="text-lg mb-8 max-w-md">
              Earn competitive pay with flexible hours while delivering happiness to customers across Tunisia.
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
                Flexible working hours
              </p>
              <p className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Competitive earnings
              </p>
              <p className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Weekly payments
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeDelivery;