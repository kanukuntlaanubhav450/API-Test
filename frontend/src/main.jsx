import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import ForgotPassword from "./auth/ForgotPassword";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ResetPassword from "./auth/ResetPassword";


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
     



    </Routes>
  </BrowserRouter>
);
