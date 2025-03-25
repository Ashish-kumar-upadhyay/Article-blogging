import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import "./Navbar.css"; // CSS file import karein

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Logout ke baad Home page pe redirect
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">MyBlog</div>
      <ul className="nav-links">
        <li>
          <Link to="/user">Home</Link>
        </li>

        
        <li>
          <Link to="/article"> Write Articles</Link>
        </li>
        <li>
          <Link to="/my-articles">MyArticles</Link>
        </li>
      </ul>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
