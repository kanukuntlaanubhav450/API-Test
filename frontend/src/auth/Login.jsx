import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { logLogin } from "../utils/logUserEvent";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // ✅ Store login details inside Firestore -> loginDetails collection
      await logLogin(userCredential.user);

     // ✅ Store login details inside Firestore → loginDetails collection
     await logLogin(userCredential.user);

     navigate("/");
      navigate("/");

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <button
        onClick={() => navigate("/")}
        className="absolute top-3 right-3 text-red-600 hover:text-red text-2xl font-bold"
      >
        ×
      </button>

      <div className="flex flex-col items-center p-6">
        <h2 className="text-xl mb-4">Login</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="border px-3 py-2 w-64 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border px-3 py-2 w-64 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-black px-4 py-2 rounded w-64"
        >
          Login
        </button>

        <p className="text-center mt-3 text-sm">
          <a href="/forgot-password" className="text-blue-600 underline"></a>
        <p className="text-center mt-3 text-sm">
          <Link to="/forgot-password" className="text-blue-600 underline">
            Forgot Password?
          </Link>
        </p>          <Link to="/signup" className="text-blue-600 hover:underline">
            Don't have an account? Sign Up
          </Link>
        </p>
       
      </div>
    </>
  );
}
