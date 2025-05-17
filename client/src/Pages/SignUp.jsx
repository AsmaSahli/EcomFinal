import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { signUpStart, signUpSuccess, signUpFailure } from "../redux/user/userSlice";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; 
import logo from "../assets/ecomLogo.png";
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from 'react-i18next';

const SignUp = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("buyer");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      setPhoneNumber(value);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t('signUp.errors.passwordMismatch'));
      return;
    }

    if (phoneNumber.length !== 8) {
      toast.error(t('signUp.errors.invalidPhone'));
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
          phoneNumber: `+216${phoneNumber}`
        },
        { withCredentials: true }
      );
      dispatch(signUpSuccess(response.data.user)); 
      toast.success(t('signUp.success')); 
      navigate("/"); 
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('signUp.errors.generic');
      dispatch(signUpFailure(errorMessage));
      toast.error(errorMessage); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Ecom Logo" className="h-20" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">{t('signUp.title')}</h2>
        <p className="text-center text-gray-600 mb-6">
          {t('signUp.subtitle')}
        </p>

        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Name Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-600">{t('signUp.nameLabel')}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('signUp.namePlaceholder')}
              className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* Email Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-600">{t('signUp.emailLabel')}</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('signUp.emailPlaceholder')}
              className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-600">{t('signUp.passwordLabel')}</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('signUp.passwordPlaceholder')}
              className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-600">{t('signUp.confirmPasswordLabel')}</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('signUp.confirmPasswordPlaceholder')}
              className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
              minLength={6}
            />
          </div>

          {/* Address Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-600">{t('signUp.addressLabel')}</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('signUp.addressPlaceholder')}
              className="input input-bordered w-full bg-white border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          {/* Phone Number Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-600">{t('signUp.phoneLabel')}</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-600">
                +216
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder={t('signUp.phonePlaceholder')}
                className="flex-1 input input-bordered rounded-r-md border-l-0 border-gray-300 bg-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                maxLength={8}
                required
              />
            </div>
            <label className="label">
              <span className="label-text-alt text-gray-400">
                {t('signUp.phoneHint')}
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
            {t('signUp.submitButton')}
          </button>
        </form>

        {/* Sign In Section */}
        <div className="text-center mt-4">
          <p className="mb-2 text-gray-600">{t('signUp.existingAccountPrompt')}</p>
          <Link
            to="/login"
            className="btn btn-outline w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900"
          >
            {t('signUp.signInLink')}
          </Link>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default SignUp;