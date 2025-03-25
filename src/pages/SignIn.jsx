


import React from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, db } from "../firebase"; // db ko import karein
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const SignUp = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Firestore me user data save karna
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        role: "user", // Default role
        createdAt: new Date(),
      }, { merge: true }); // Agar user already exist kare toh data overwrite na ho
  
      console.log("User Signed In: ", user);
      navigate("/user");
    } catch (error) {
      console.error("Error signing in: ", error.message);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Welcome to BlogVerse</h1>
      <button onClick={handleGoogleSignIn} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Sign in with Google
      </button>
    </div>
  );
};

export default SignUp;
