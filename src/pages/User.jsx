import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore";
import Navbar from "./Navbar";
import "../App.css";

const User = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesRef = collection(db, "articles");
        const snapshot = await getDocs(articlesRef);

        const allArticles = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setArticles(allArticles);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };

    fetchArticles();
  }, []);

  // 🔥 Like/Unlike Function
  const handleLike = async (articleId, likedBy) => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to like an article!");
      return;
    }

    const userId = user.uid;
    const articleRef = doc(db, "articles", articleId);

    try {
      if (likedBy.includes(userId)) {
        // Unlike logic
        await updateDoc(articleRef, {
          likes: increment(-1),
          likedBy: arrayRemove(userId),
        });

        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article.id === articleId
              ? {
                  ...article,
                  likes: (article.likes || 0) - 1,
                  likedBy: article.likedBy.filter((id) => id !== userId),
                }
              : article
          )
        );
      } else {
        // Like logic
        await updateDoc(articleRef, {
          likes: increment(1),
          likedBy: arrayUnion(userId),
        });

        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article.id === articleId
              ? {
                  ...article,
                  likes: (article.likes || 0) + 1,
                  likedBy: [...article.likedBy, userId],
                }
              : article
          )
        );
      }
    } catch (error) {
      console.error("Error liking/unliking article:", error);
    }
  };

  // 💬 Add Comment Function
  const handleComment = async (articleId) => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to comment!");
      return;
    }

    if (!commentText[articleId]) return alert("Comment cannot be empty!");

    const articleRef = doc(db, "articles", articleId);

    try {
      await updateDoc(articleRef, {
        comments: arrayUnion({
          userId: user.uid,
          username: user.displayName || "Anonymous",
          text: commentText[articleId],
        }),
      });

      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === articleId
            ? {
                ...article,
                comments: [
                  ...(article.comments || []),
                  { userId: user.uid, username: user.displayName || "Anonymous", text: commentText[articleId] },
                ],
              }
            : article
        )
      );

      setCommentText((prev) => ({ ...prev, [articleId]: "" }));
      alert("Comment Added!");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ textAlign: "center", padding: "20px", backgroundColor: "transparent" }}>

        <h1>All Articles</h1>

        {loading ? (
          <p>Loading articles...</p>
        ) : articles.length === 0 ? (
          <p>No articles found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {articles.map((article) => (
              <li
                key={article.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  textAlign: "left",
                }}
              >
                <h3>{article.title}</h3>
                <p>{article.content}</p>
                <small>
                  <b>By:</b> {article.author || "Unknown"} | <b>Created At:</b> {article.createdAt?.toDate().toLocaleString()}
                </small>
                <br />
                <button
                  onClick={() => handleLike(article.id, article.likedBy || [])}
                  style={{
                    padding: "8px 15px",
                    marginTop: "10px",
                    backgroundColor: article.likedBy?.includes(auth.currentUser?.uid) ? "gray" : "purple",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {article.likedBy?.includes(auth.currentUser?.uid) ? "👎 Unlike" : "👍 Like"} ({article.likes || 0})
                </button>

                {/* 💬 Comment Section */}
                <div style={{ marginTop: "10px" }}>
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText[article.id] || ""}
                    onChange={(e) => setCommentText((prev) => ({ ...prev, [article.id]: e.target.value }))}
                    style={{ width: "70%", padding: "5px", marginRight: "5px" }}
                  />
                  <button
                    onClick={() => handleComment(article.id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "blue",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    💬 Comment
                  </button>
                </div>

                {/* 📜 Show Comments */}
                {article.comments && article.comments.length > 0 && (
                  <div style={{ marginTop: "10px", paddingLeft: "10px" }}>
                    <b>Comments:</b>
                    <ul style={{ listStyle: "none", paddingLeft: "0" }}>
                      {article.comments.map((comment, index) => (
                        <li key={index} style={{ padding: "5px", borderBottom: "1px solid #ddd" }}>
                          <b>{comment.username}:</b> {comment.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default User;
