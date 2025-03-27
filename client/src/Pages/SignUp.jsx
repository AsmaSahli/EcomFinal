import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { signUpStart, signUpSuccess, signUpFailure } from "../redux/user/userSlice";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; 
import logo from "../assets/ecomLogo.png";
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(""); // Only store the local part
  const [role, setRole] = useState("buyer");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    if (value.length <= 8) { // Tunisian numbers are 8 digits after +216
      setPhoneNumber(value);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (phoneNumber.length !== 8) {
      toast.error("Please enter a valid 8-digit Tunisian phone number");
      return;
    }

    dispatch(signUpStart()); 

    try {
      const response = await axios.post(
        "http://localhost:8000/signup", 
        { 
          name, 
          email, 
          password, 
          confirmPassword, 
          role, 
          address, 
          phoneNumber: `+216${phoneNumber}` // Combine with country code
        },
        { withCredentials: true }
      );
      dispatch(signUpSuccess(response.data.user)); 
      toast.success("Signup successful!"); 
      navigate("/"); 
    } catch (err) {
      dispatch(signUpFailure(err.response?.data?.message || "Something went wrong!"));
      toast.error(err.response?.data?.message || "Something went wrong!"); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Ecom Logo" className="h-20" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">Create an Account</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your details to sign up.
        </p>

        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Name Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-600">Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* Email Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-600">Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-600">Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-600">Confirm Password</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
              minLength={6}
            />
          </div>

          {/* Address Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-600">Address</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* Phone Number Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-600">Phone Number</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-600">
                +216
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="20 123 456"
                className="flex-1 input input-bordered rounded-r-md border-l-0 border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                maxLength={8}
                required
              />
            </div>
            <label className="label">
              <span className="label-text-alt text-gray-400">
                Tunisian number (8 digits)
              </span>
            </label>
          </div>

          {/* Hidden Role Field */}
          <input type="hidden" name="role" value={role} />

          {/* Sign Up Button */}
          <button
            type="submit"
            className="btn btn-primary w-full mt-2 text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:bg-primary-focus"
          >
            Sign Up
          </button>
        </form>

        {/* Sign In Section */}
        <div className="text-center mt-4">
          <p className="mb-2 text-gray-600">Already have an account?</p>
          <Link
            to="/login"
            className="btn btn-outline w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900"
          >
            Sign In
          </Link>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default SignUp;