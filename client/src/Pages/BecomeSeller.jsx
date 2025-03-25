import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/ecomLogo.png";

const BecomeSeller = () => {
  const [formData, setFormData] = useState({
    email: "",
    shopName: "",
    headquartersAddress: "",
    fiscalIdentificationCard: null,
    tradeRegister: null,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" }); // State for alerts
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      // Validate file type and size
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

      // Show success alert
      setAlert({
        show: true,
        type: "success",
        message:
          "Your application has been submitted successfully! Please wait for our team to review your request. We will contact you via email.",
      });

      // Reset the form
      setFormData({
        email: "",
        shopName: "",
        headquartersAddress: "",
        fiscalIdentificationCard: null,
        tradeRegister: null,
      });
    } catch (err) {
      // Show error alert
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
      {/* DaisyUI Alert */}
      {alert.show && (
        <div className={`alert alert-${alert.type} fixed top-4 right-4 w-96 z-50`}>
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
        {/* Left Side - Form */}
        <div className="w-1/2 p-6">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Ecom Logo" className="h-16" />
          </div>
          <h2 className="text-xl font-bold text-center mb-3">Become a Seller</h2>
          <p className="text-center text-gray-600 mb-5 text-sm">
            Start your journey as a seller by filling out the form below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600 text-sm">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="input input-bordered w-full bg-white border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                required
              />
            </div>

            {/* Shop Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600 text-sm">Shop Name</span>
              </label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                placeholder="Enter your shop name"
                className="input input-bordered w-full bg-white border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                required
              />
            </div>

            {/* Headquarters Address */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-600 text-sm">Headquarters Address</span>
              </label>
              <input
                type="text"
                name="headquartersAddress"
                value={formData.headquartersAddress}
                onChange={handleChange}
                placeholder="Enter your headquarters address"
                className="input input-bordered w-full bg-white border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                required
              />
            </div>

            {/* Fiscal Identification Card and Trade Register */}
            <div className="flex gap-3">
              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text text-gray-600 text-sm">Fiscal Identification Card</span>
                </label>
                <input
                  type="file"
                  name="fiscalIdentificationCard"
                  onChange={handleChange}
                  className="file-input file-input-bordered w-full bg-white border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  required
                />
              </div>
              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text text-gray-600 text-sm">Trade Register</span>
                </label>
                <input
                  type="file"
                  name="tradeRegister"
                  onChange={handleChange}
                  className="file-input file-input-bordered w-full bg-white border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full text-white font-semibold py-2 rounded-lg transition-all duration-300 text-sm ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary-focus hover:shadow-lg"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="text-center">
            <p className="mb-2 text-gray-600 text-sm">Already a seller?</p>
            <button
              className="btn btn-outline w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-300 text-sm"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Right Side - Vertical Steps */}
        <div className="w-1/2 bg-gradient-to-r from-blue-100 to-purple-100 p-6 flex flex-col justify-center items-center">
          <ul className="steps steps-vertical">
            {/* Step 1 */}
            <li className="step step-primary">
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">Step 1: Fill out your registration request</h3>
                <p className="text-gray-600 text-sm">Complete the initial registration form to begin the process.</p>
              </div>
            </li>

            {/* Step 2 */}
            <li className="step step-primary">
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">Step 2: Complete the registration form</h3>
                <p className="text-gray-600 text-sm">You will receive an email with further instructions and required documents.</p>
              </div>
            </li>

            {/* Step 3 */}
            <li className="step">
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">Step 3: Application Review</h3>
                <p className="text-gray-600 text-sm">Our team will carefully review your application and documents.</p>
              </div>
            </li>

            {/* Step 4 */}
            <li className="step">
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800">Step 4: Start Selling</h3>
                <p className="text-gray-600 text-sm">Once approved, you can start making your first sales on our platform 🥳.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default BecomeSeller;