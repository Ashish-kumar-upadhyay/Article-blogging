import React, { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Navbar from "./Navbar";

const ArticleForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false); // 🔥 New state for loading

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return alert("Please fill all fields!");

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to publish an article!");
      return;
    }

    setIsPublishing(true); // 🔥 Disable button & show "Publishing..."

    try {
      const articlesRef = collection(db, "articles");

      await addDoc(articlesRef, {
        title,
        content,
        author: user.displayName,
        userId: user.uid,
        status: "public",
        createdAt: serverTimestamp(),
      });

      setTitle("");
      setContent("");
      alert("Article Published!");
    } catch (error) {
      console.error("Error adding article:", error);
    }

    setIsPublishing(false); // 🔥 Enable button after completion
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center" }}>
        <h2>Publish an Article</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
          <textarea
            placeholder="Write your article here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="6"
            style={{ width: "100%", padding: "10px" }}
          />
          <button
            type="submit"
            disabled={isPublishing} // 🔥 Disable when publishing
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: isPublishing ? "gray" : "blue",
              color: "#fff",
              border: "none",
              cursor: isPublishing ? "not-allowed" : "pointer",
            }}
          >
            {isPublishing ? "Publishing..." : "Publish"} {/* 🔥 UI feedback */}
          </button>
        </form>
      </div>
    </>
  );
};

export default ArticleForm;
