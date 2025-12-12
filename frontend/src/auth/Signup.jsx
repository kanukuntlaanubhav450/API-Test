import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { logSignup } from "../utils/logUserEvent";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Auto-redirect when success occurs
  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => navigate("/"), 1500);
      return () => clearTimeout(timeout);
    }
  }, [success, navigate]);

  const handleSignup = async () => {
    setError("");
    setSuccess("");

    // Validate input
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      // 1️⃣ Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2️⃣ Log signup event
      try {
        await logSignup(userCredential.user);
      } catch (logError) {
        console.error("Failed to log signup event:", logError);
      }

      // 3️⃣ Success
      setSuccess("🎉 Account created successfully! Redirecting...");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      {/* Close (X) Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-3 right-3 text-red-600 hover:text-red-800 text-2xl font-bold"
      >
        ×
      </button>

      <div className="flex flex-col items-center p-6">

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          className="border px-3 py-2 w-64 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          className="border px-3 py-2 w-64 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          className="bg-green-600 text-black px-4 py-2 rounded w-64"
        >
          Create Account
        </button>

        {/* Error Message */}
        {error && <p className="text-red-600 mt-3">{error}</p>}

        {/* Success Message */}
        {success && <p className="text-green-600 mt-3">{success}</p>}

        <p className="text-center mt-3">
          <Link to="/login" className="text-blue-600 hover:underline">
            Already have an account? Login
          </Link>
        </p>
      </div>
    </>
  );
}
