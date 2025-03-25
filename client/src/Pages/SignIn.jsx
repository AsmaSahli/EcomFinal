import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice";
import { useNavigate, Link } from "react-router-dom"; // Import Link from react-router-dom
import axios from "axios";
import logo from "../assets/ecomLogo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OAuth from "../components/OAuth";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);


  const handleSignIn = async (e) => {
    e.preventDefault();

    dispatch(signInStart());

    try {
      const response = await axios.post(
        "http://localhost:8000/signin",
        { email, password },
        { withCredentials: true }
      );
      dispatch(signInSuccess(response.data.user));
      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      dispatch(signInFailure(err.response.data.message || "Something went wrong!"));
      toast.error(err.response.data.message || "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Ecom Logo" className="h-20" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">Welcome Back</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email and password to sign in.
        </p>

        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text text-gray-600">Email</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="form-control w-full mb-6">
          <label className="label">
            <span className="label-text text-gray-600">Password</span>
          </label>
          <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500"
          >
            {showPassword ? "🔓" : "🔒"}
          </button>
        </div>

          <div className="text-right mt-2">
            {/* Update the Forgot Password link */}
            <Link
              to="/forgot-password" // Add the route to the Forgot Password page
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          onClick={handleSignIn}
          className="btn btn-primary w-full mb-4 text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:bg-primary-focus"
        >
          Sign In
        </button>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-4 text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <OAuth />

        <div className="text-center">
          <p className="mb-2 text-gray-600">New to Electsy?</p>
          <Link
            to="/signup"
            className="btn btn-outline w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900"
          >
            Create an account
          </Link>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default SignIn;