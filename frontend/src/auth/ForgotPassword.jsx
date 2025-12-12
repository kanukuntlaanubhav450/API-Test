import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";



export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
  try {
    await sendPasswordResetEmail(auth, email);
    setSent(true);
  } catch (err) {
    setError(err.message);
  }
};



  return (
    <>
      <button
        onClick={() => navigate("/")}
        className="absolute top-3 right-3 text-red-600 text-3xl font-bold"
      >
        ×
      </button>

      <div className="flex flex-col items-center p-6">
        <h2 className="text-xl mb-4">Reset Password</h2>

        {!sent ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="border px-3 py-2 w-64 mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={handleReset}
              className="bg-blue-600 text-black px-4 py-2 rounded w-64"
            >
              Send Reset Code
            </button>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </>
        ) : (
          <p className="text-green-600 text-center mt-4">
            Reset email sent! Check your inbox.
          </p>
        )}

        <p className="text-center mt-4">
          <Link to="/login" className="text-blue-600 underline">
            Back to Login
          </Link>
        </p>
      </div>
    </>
  );
}
