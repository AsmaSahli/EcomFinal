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
  const [phoneNumber, setPhoneNumber] = useState("+216"); // Default prefix for Tunisia
  const [role, setRole] = useState("buyer"); // Default role is "buyer"
  const [shopName, setShopName] = useState("");
  const [businessRegistrationNumber, setbusinessRegistrationNumber] = useState("");
  const [vatNumber, setvatNumber] = useState("");
  const [returnAddress, setreturnAddress] = useState("");
  const [headquartersAddress, setHeadquartersAddress] = useState("");
  const [customerServiceAddress, setcustomerServiceAddress] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validate password match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // Validate phone number starts with +216
    if (!phoneNumber.startsWith("+216")) {
      toast.error("Phone number must start with +216 for Tunisia.");
      return;
    }

    dispatch(signUpStart()); 

    try {
      const userData = {
        name, 
        email, 
        password, 
        confirmPassword, 
        role, 
        address, 
        phoneNumber,
        ...(role === 'seller' && {
          shopName,
          businessRegistrationNumber,
          vatNumber,
          returnAddress,
          headquartersAddress,
          customerServiceAddress
        }),
        ...(role === 'delivery' && {
          vehicleType
        })
      };

      const response = await axios.post(
        "http://localhost:8000/signup", 
        userData,
        { withCredentials: true }
      );
      dispatch(signUpSuccess(response.data.user)); 
      toast.success("Signup successful!"); 
      navigate("/"); 
    } catch (err) {
      dispatch(signUpFailure(err.response.data.message || "Something went wrong!"));
      toast.error(err.response.data.message || "Something went wrong!"); 
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

        {/* Role Selection */}
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text text-gray-600">Role</span>
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>

        {/* Name Field */}
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text text-gray-600">Name</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Email Field */}
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

        {/* Password Field */}
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text text-gray-600">Password</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Confirm Password Field */}
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text text-gray-600">Confirm Password</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Address Field */}
        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text text-gray-600">Address</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
            className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Phone Number Field */}
        <div className="form-control w-full mb-6">
          <label className="label">
            <span className="label-text text-gray-600">Phone Number</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">+216</span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value;
                if (value.startsWith("+216")) {
                  setPhoneNumber(value);
                }
              }}
              placeholder="Enter your phone number"
              className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 pl-12"
            />
          </div>
        </div>

        {/* Seller-specific fields */}
        {role === 'seller' && (
          <>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text text-gray-600">Shop Name</span>
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Enter your shop name"
                className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text text-gray-600">Business Registration Number</span>
              </label>
              <input
                type="text"
                value={businessRegistrationNumber}
                onChange={(e) => setbusinessRegistrationNumber(e.target.value)}
                placeholder="Enter your business registration number"
                className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text text-gray-600">VAT Number</span>
              </label>
              <input
                type="text"
                value={vatNumber}
                onChange={(e) => setvatNumber(e.target.value)}
                placeholder="Enter your VAT number"
                className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text text-gray-600">Return Address</span>
              </label>
              <input
                type="text"
                value={returnAddress}
                onChange={(e) => setreturnAddress(e.target.value)}
                placeholder="Enter your return address"
                className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text text-gray-600">Headquarters Address</span>
              </label>
              <input
                type="text"
                value={headquartersAddress}
                onChange={(e) => setHeadquartersAddress(e.target.value)}
                placeholder="Enter your headquarters address"
                className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text text-gray-600">Customer Service Address</span>
              </label>
              <input
                type="text"
                value={customerServiceAddress}
                onChange={(e) => setcustomerServiceAddress(e.target.value)}
                placeholder="Enter your customer service address"
                className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </>
        )}

        {/* Delivery-specific fields */}
        {role === 'delivery' && (
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text text-gray-600">Vehicle Type</span>
            </label>
            <input
              type="text"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              placeholder="Enter your vehicle type"
              className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {/* Sign Up Button */}
        <button
          onClick={handleSignUp}
          className="btn btn-primary w-full mb-4 text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:bg-primary-focus"
        >
          Sign Up
        </button>

        {/* Sign In Section */}
        <div className="text-center">
          <p className="mb-2 text-gray-600">Already have an account?</p>
          <Link
            to="/login" // Add your signin route here
            className="btn btn-outline w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* ToastContainer for displaying toast messages */}
      <ToastContainer />
    </div>
  );
};

export default SignUp;