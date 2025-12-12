import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// LOGIN
export const logLogin = async (user) => {
  if (!user || !user.uid) return;

  const doc = {
    uid: user.uid,
    timestamp: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "loginDetails"), doc);
  } catch (err) {
    // Fail gracefully: log the error so it's observable but don't throw
    console.error("logLogin: failed to write loginDetails", err);
  }
};

// SIGNUP
export const logSignup = async (user) => {
  if (!user || !user.uid) return;

  const doc = {
    uid: user.uid,
    timestamp: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "signupDetails"), doc);
  } catch (err) {
    console.error("logSignup: failed to write signupDetails", err);
  }
};

// LOGOUT
export const logLogout = async (user) => {
  if (!user || !user.uid) return;

  const doc = {
    uid: user.uid,
    timestamp: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "logoutDetails"), doc);
  } catch (err) {
    console.error("logLogout: failed to write logoutDetails", err);
  }
};
