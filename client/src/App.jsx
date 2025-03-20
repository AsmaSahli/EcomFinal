import { Navigate, Route, Routes } from "react-router-dom";

import { BrowserRouter } from 'react-router-dom';
import './App.css'
import { Home } from "./Pages/Home";
import Header from "./components/Header";
import SignIn from "./Pages/SignIn";
import AuthentificationRoute from "./components/AuthentificationRoute";
import SignUp from "./Pages/SignUp";
import ForgotPassword from "./components/ForgotPassword ";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Header/>
          <Routes>
          <Route element={<AuthentificationRoute/>} >
          <Route path="/login" element={< SignIn/>} />
          <Route path="/signup" element={<SignUp/>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

        </Route>

          <Route path="/" element={<Navigate to="/homePage" />} />
          <Route path="/homePage" element={< Home/>} />

          </Routes>

    </BrowserRouter>

  );
}

export default App
