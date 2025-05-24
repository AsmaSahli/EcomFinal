import { Navigate, Route, Routes } from "react-router-dom";
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import './App.css';
import { Home } from "./Pages/Home";
import Header from "./components/Header";
import SignIn from "./Pages/SignIn";
import AuthentificationRoute from "./components/AuthentificationRoute";
import SignUp from "./Pages/SignUp";
import ForgotPassword from "./components/ForgotPassword ";
import ResetPassword from "./components/ResetPassword";
import BecomeSeller from "./Pages/BecomeSeller";
import BecomeDelivery from "./Pages/BecomeDelivery";
import ApplicationStatus from "./Pages/ApplicationStatus";
import SetPassword from "./Pages/SetPassword";
import SellerDashboard from "./Pages/SellerDashboard";
import DeliveryDashboard from "./Pages/DeliveryDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import ProductCategoryPage from "./Pages/ProductCategoryPage";
import SellerProductsPage from "./Pages/SellerProductsPage";
import WishlistPage from "./Pages/WishlistPage";
import CartPage from "./Pages/CartPage";
import ProductDetailsPage from "./Pages/ProductDetailsPage";
import CheckoutPage from "./Pages/CheckoutPage";


function App() {
  return (
    <BrowserRouter>
      <Header />
      {/* Add ToastContainer here to make it globally available */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/homePage" />} />
        <Route path="/homePage" element={<Home />} />
        <Route path="/products" element={<ProductCategoryPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/sellers/:sellerId/products" element={<SellerProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/checkout" element={<CheckoutPage/>} />

        
        {/* Authentication routes (only for non-logged in users) */}
        <Route element={<AuthentificationRoute />}>
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/become-seller" element={<BecomeSeller />} />
          <Route path="/join-delivery-team" element={<BecomeDelivery />} />
          <Route path="/application-status" element={<ApplicationStatus />} />
          <Route path="/set-password" element={<SetPassword />} />
        </Route>
        
        {/* Protected routes with role-based access */}
        <Route element={<PrivateRoute allowedRoles={['seller']} />}>
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
        </Route>
        
        <Route element={<PrivateRoute allowedRoles={['delivery']} />}>
          <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
        </Route>
        
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
        
        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;