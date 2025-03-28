import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/ecomLogo.png";

const ApplicationStatus = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const checkStatus = async () => {
    if (!email) {
      setError("Please enter your email");
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
            <p>Your application has been approved!</p>
            <p>Please check your email for more details.</p>
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
        toast.info("Your application is still under review.", {
          autoClose: 3000,
        });
      } else if (response.data.status === "rejected") {
        toast.error(
          <div>
            <p>Your application has been rejected.</p>
            <p>Check your email for more information.</p>
          </div>,
          {
            autoClose: 5000,
          }
        );
      }
    } catch (err) {
      setError("Error fetching application status. Please try again.");
      toast.error("Error fetching application status", {
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
          Check Application Status
        </h2>
        
        {/* Email Input */}
        <input
          type="email"
          placeholder="Enter your email"
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
          }`}
        >
          {isLoading ? "Checking..." : "Check Status"}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {/* Application Status */}
        {status && (
          <div className="mt-4 text-center">
            <p className="text-lg text-gray-700">{`Status: ${status}`}</p>
            {status === "approved" && (
              <p className="text-sm text-green-600 mt-2">
                You will be redirected to login page shortly...
              </p>
            )}
          </div>
        )}

        {/* Link to go back to the seller page */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Want to become a seller?{" "}
            <a href="/become-seller" className="text-blue-500 hover:underline">
              Click here to apply
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;