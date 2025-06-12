import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaRegCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { clearCart } from '../redux/user/cartSlice';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with publishable key

const stripePromise = loadStripe("pk_test_51RXB8eR0JuzwW2NjHpnGlvorMUFn3PHqq57fFASeLWm7jL4oT4CdvOYRfVJdEgNNscQmkwXA0TXAAOA14ifTEfzn00FulqPdkB");
const CheckoutPage = () => {

 
  const { t } = useTranslation();
  const { currentUser } = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.cart?.items || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: currentUser?.phoneNumber || '',
    email: currentUser?.email || '',
    street: '',
    apartment: '',
    city: '',
    postalCode: '',
    governorate: '',
    deliveryInstructions: '',
    deliveryMethod: 'standard',
    paymentMethod: 'cod',
    agreeTerms: false,
  });
  const [cardError, setCardError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  // Tunisian governorates
  const governorates = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
    'Kairouan', 'Kasserine', 'Kébili', 'Kef', 'Mahdia', 'Manouba', 'Médenine',
    'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine',
    'Tozeur', 'Tunis', 'Zaghouan'
  ];

  // Calculate order totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = formData.deliveryMethod === 'pickup' ? 0 : formData.deliveryMethod === 'express' ? 9.99 : (subtotal > 50 ? 0 : 5.99);
  const tax = subtotal * 0.19;
  const total = (subtotal + shipping + tax).toFixed(2);

  // Step validation
  const validateStep = (step) => {
    switch (step) {
      case 1:
        return (
          formData.firstName.trim() &&
          formData.lastName.trim() &&
          formData.phone.trim() &&
          formData.email.trim()
        );
      case 2:
        return (
          formData.street.trim() &&
          formData.city.trim() &&
          formData.governorate.trim()
        );
      case 3:
        return formData.deliveryMethod.trim();
      case 4:
        return formData.paymentMethod.trim() && 
               (formData.paymentMethod !== 'stripe' || (stripe && elements));
      default:
        return false;
    }
  };

  // Debug active step
  useEffect(() => {
    console.log('Active Step:', activeStep);
  }, [activeStep]);

  // Debug button disabled conditions
  useEffect(() => {
    if (activeStep === 4) {
      console.log('Place Order Button Disabled Conditions:', {
        loading,
        agreeTerms: formData.agreeTerms,
        isStripe: formData.paymentMethod === 'stripe',
        stripeInitialized: !!stripe,
        clientSecretExists: !!clientSecret,
      });
    }
  }, [activeStep, loading, formData.agreeTerms, formData.paymentMethod, stripe, clientSecret]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login?redirect=checkout');
    }
    if (!orderPlaced && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [currentUser, cartItems, navigate, orderPlaced]);

  // Create payment intent
  useEffect(() => {
    console.log('Payment Intent useEffect Conditions:', {
      paymentMethod: formData.paymentMethod,
      activeStep,
      clientSecret,
      step4Valid: validateStep(4),
    });
    if (formData.paymentMethod === 'stripe' && activeStep === 4 && !clientSecret && validateStep(4)) {
      createPaymentIntent();
    }
  }, [formData.paymentMethod, activeStep, clientSecret]);

  const createPaymentIntent = async () => {
    console.log('Starting createPaymentIntent with amount:', Math.round(total * 100));
    try {
      const response = await axios.post('http://localhost:8000/api/payments/create-payment-intent', {
        amount: Math.round(total * 100, 0),
        currency: 'usd',
      });
      console.log('Payment Intent API Response:', response.data);
      if (response.data.clientSecret) {
        setClientSecret(response.data.clientSecret);
        console.log('clientSecret set to:', response.data.clientSecret);
      } else {
        console.error('No clientSecret in response:', response.data);
        toast.error('Failed to initialize payment: No clientSecret returned');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error.message, error.response?.data);
      toast.error(error.response?.data?.message || t('checkout.errors.paymentIntentError') || 'Failed to initialize payment');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('Input Change:', { name, value, checked });
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (name === 'paymentMethod' && value !== 'stripe') {
      setClientSecret('');
    }
  };

  const handleNextStep = () => {
    if (activeStep < 4) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      setClientSecret('');
    }
  };

 const handleSubmitOrder = async () => {
  if (!formData.agreeTerms) {
    toast.error(t('checkout.errors.agreeTerms'));
    return;
  }

  setLoading(true);
  try {
    let paymentResult = null;

    if (formData.paymentMethod === 'stripe') {
      if (!stripe || !elements || !clientSecret) {
        toast.error(t('checkout.errors.stripeNotLoaded'));
        setLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.street,
              line2: formData.apartment || '',
              city: formData.city,
              postal_code: formData.postalCode || '',
              state: formData.governorate,
              country: 'TN'
            }
          }
        }
      });

      if (error) {
        setCardError(error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        paymentResult = {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency
        };
      } else {
        toast.error(t('checkout.errors.paymentFailed'));
        setLoading(false);
        return;
      }
    }

    const orderData = {
      userId: currentUser.id,
      items: cartItems.map(item => ({
        productId: item.productId._id,
        sellerId: item.sellerId._id,
        quantity: item.quantity,
        price: item.price,
        promotion: item.promotion ? item.promotion.promotionId._id : null // Send only promotionId
      })),
      shippingInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        address: {
          street: formData.street,
          apartment: formData.apartment,
          city: formData.city,
          postalCode: formData.postalCode,
          governorate: formData.governorate,
          deliveryInstructions: formData.deliveryInstructions
        }
      },
      deliveryMethod: formData.deliveryMethod,
      paymentMethod: formData.paymentMethod,
      subtotal,
      shipping,
      tax,
      total,
      paymentResult
    };

    console.log('Submitting Order Data:', orderData); // Debug log

    const response = await axios.post('http://localhost:8000/api/orders', orderData);

    toast.success(t('checkout.success.orderPlaced'), {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    dispatch(clearCart());
    setOrderPlaced(true);

    navigate(`/trackOrder/${response.data.order._id}`);
  } catch (error) {
    console.error('Order submission error:', error.response?.data || error.message);
    toast.error(error.response?.data?.message || t('checkout.errors.submitError'));
    setLoading(false);
  }
};

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{t('checkout.title')}</h1>
          <p className="text-gray-500">{t('checkout.subtitle')}</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-purple-600 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${(activeStep - 1) * 33.33}%` }}
            ></div>

            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${activeStep >= step ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {step}
                </div>
                <span className={`text-xs font-medium ${activeStep >= step ? 'text-purple-600' : 'text-gray-500'}`}>
                  {t(`checkout.steps.step${step}`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <IoMdCheckmarkCircleOutline className="text-purple-600" />
                  {t('checkout.personalInfo.title')}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.personalInfo.firstName')} *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.personalInfo.lastName')} *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.personalInfo.phone')} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.personalInfo.email')} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-purple-600" />
                  {t('checkout.shippingAddress.title')}
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.shippingAddress.street')} *
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.shippingAddress.apartment')}
                    </label>
                    <input
                      type="text"
                      id="apartment"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('checkout.shippingAddress.city')} *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('checkout.shippingAddress.postalCode')}
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="governorate" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.shippingAddress.governorate')} *
                    </label>
                    <select
                      id="governorate"
                      name="governorate"
                      value={formData.governorate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">{t('checkout.shippingAddress.selectGovernorate')}</option>
                      {governorates.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.shippingAddress.deliveryInstructions')}
                    </label>
                    <textarea
                      id="deliveryInstructions"
                      name="deliveryInstructions"
                      value={formData.deliveryInstructions}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    ></textarea>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  {t('checkout.deliveryMethod.title')}
                </h2>

                <div className="space-y-4">
                  <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="standard"
                      checked={formData.deliveryMethod === 'standard'}
                      onChange={handleInputChange}
                      className="mt-0.5 mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{t('checkout.deliveryMethod.standard')}</span>
                        <span className="font-bold">{subtotal > 50 ? t('checkout.orderSummary.free') : '$5.99'}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('checkout.deliveryMethod.standardDescription')}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="express"
                      checked={formData.deliveryMethod === 'express'}
                      onChange={handleInputChange}
                      className="mt-0.5 mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{t('checkout.deliveryMethod.express')}</span>
                        <span className="font-bold">$9.99</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('checkout.deliveryMethod.expressDescription')}
                      </p>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}

            {activeStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  {t('checkout.paymentMethod.title')}
                </h2>

                <div className="space-y-4">
                  <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="mt-0.5 mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FaMoneyBillWave className="text-green-600 text-xl" />
                        <span className="font-medium">{t('checkout.paymentMethod.cod')}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 ml-8">
                        {t('checkout.paymentMethod.codDescription')}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={formData.paymentMethod === 'stripe'}
                      onChange={handleInputChange}
                      className="mt-0.5 mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FaRegCreditCard className="text-blue-600 text-xl" />
                        <span className="font-medium">{t('checkout.paymentMethod.stripe')}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 ml-8">
                        {t('checkout.paymentMethod.stripeDescription')}

                      </p>
                      {formData.paymentMethod === 'stripe' && (
                        <div className="mt-4 ml-8">
                          <CardElement 
                            options={cardElementOptions}
                            onChange={(event) => {
                              setCardError(event.error ? event.error.message : null);
                            }}
                          />
                          {cardError && (
                            <p className="text-red-500 text-sm mt-2">{cardError}</p>
                          )}
                          {!clientSecret && formData.paymentMethod === 'stripe' && (
                            <p className="text-yellow-600 text-sm mt-2">
                              {t('checkout.paymentMethod.initializingPayment')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </label>

                  <div className="mt-6">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleInputChange}
                        className="mt-0.5 mr-3 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        {t('checkout.termsAgreement.part1')}{' '}
                        <a href="/terms" className="text-purple-600 hover:underline">
                          {t('checkout.termsAgreement.terms')}
                        </a>{' '}
                        {t('checkout.termsAgreement.and')}{' '}
                        <a href="/privacy" className="text-purple-600 hover:underline">
                          {t('checkout.termsAgreement.privacyPolicy')}
                        </a>
                      </span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-between mt-6">
              {activeStep > 1 ? (
                <button
                  onClick={handlePrevStep}
                  className="btn btn-outline btn-primary"
                >
                  <FaChevronLeft className="mr-1" />
                  {t('checkout.buttons.back')}
                </button>
              ) : (
                <Link to="/cart" className="btn btn-outline btn-primary">
                  <FaChevronLeft className="mr-1" />
                  {t('checkout.buttons.backToCart')}
                </Link>
              )}

              {activeStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  disabled={!validateStep(activeStep)}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('checkout.buttons.continue')}
                  <FaChevronRight className="ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitOrder}
                  disabled={loading || !formData.agreeTerms || (formData.paymentMethod === 'stripe' && (!stripe || !clientSecret))}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <>
                      {t('checkout.buttons.placeOrder')}
                      <IoMdCheckmarkCircleOutline className="ml-1 text-lg" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
                {t('checkout.orderSummary.title')}
              </h2>

              <div className="mb-6 space-y-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={item.productId.images?.[0]?.url || 'https://via.placeholder.com/150'}
                        alt={item.productId.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
                        {item.productId.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t('checkout.orderSummary.quantity')}: {item.quantity}
                      </p>
                      <p className="text-sm font-bold mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('checkout.orderSummary.subtotal')}</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('checkout.orderSummary.shipping')}</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">{t('checkout.orderSummary.free')}</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('checkout.orderSummary.tax')}</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-3">
                  <span>{t('checkout.orderSummary.total')}</span>
                  <span className="text-purple-600">${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CheckoutWithStripe = () => (
  <Elements stripe={stripePromise}>
    <CheckoutPage />
  </Elements>
);

export default CheckoutWithStripe;