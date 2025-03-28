import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/ecomLogo.png"; // Import logo

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/set-password", { token, password });
      setSuccess("Password set successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Error setting password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Ecom Logo" className="h-16" />
        </div>

        <h2 className="text-xl font-bold text-center mb-4 text-gray-800">Set Your Password</h2>

        {/* Password Input */}
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-md mb-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
        />

        {/* Confirm Password Input */}
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-md mb-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
        />

        {/* Set Password Button */}
        <button
          onClick={handleSetPassword}
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-focus focus:outline-none transition duration-300"
          disabled={loading}
        >
          {loading ? "Setting Password..." : "Set Password"}
        </button>

        {/* Error Message */}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {/* Success Message */}
        {success && <p className="text-green-500 mt-4 text-center">{success}</p>}
      </div>
    </div>
  );
};

export default SetPassword;
