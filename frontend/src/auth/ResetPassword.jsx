import React, { useState } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, useSearchParams } from "react-router-dom";



export default function ResetPassword() {
  const [params] = useSearchParams();
  const oobCode = params.get("oobCode");
    if (!oobCode) {
    return (
      <p className="text-red-600 text-center mt-10 text-xl">
        Invalid or missing reset link
      </p>
    );
  }

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    if (password !== confirm) {
      setMsg("Passwords do not match");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, password);

      setMsg("Your password has been updated!");

      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMsg("Invalid or expired reset link");
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-xl mb-4">Enter New Password</h2>

      <input
        type="password"
        placeholder="New password"
        className="border px-3 py-2 w-64 mb-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm password"
        className="border px-3 py-2 w-64 mb-3"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <button
        onClick={handleReset}
        className="bg-green-600 text-black px-4 py-2 rounded w-64"
      >
        Reset Password
      </button>

      {msg && <p className="mt-4 text-green-600">{msg}</p>}
    </div>
  );
}
