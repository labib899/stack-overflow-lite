import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleRedirect = (id) => {
    navigate(`/post-details/${id}`);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  console.log(posts)

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="text-center mb-6">
        {/* <h1 className="text-4xl font-bold text-gray-800">
          Welcome to the Home Page
        </h1> */}
      </header>

      {loading ? (
        <p className="text-center text-gray-600">Loading posts...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="flex flex-col space-y-6 px-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-700">{post.content}</p>
                <button onClick={() => handleRedirect(post.id)}>Show details</button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No posts to display</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
