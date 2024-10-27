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

        const postsWithSnippets = await Promise.all(
          response.data.map(async (post) => {
            if (post.code_snippet_url) {
              try {
                const snippetResponse = await axios.get(post.code_snippet_url, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
                post.code_snippet_content = snippetResponse.data; // Add snippet content directly to post
              } catch (error) {
                console.error("Failed to fetch code snippet:", error);
                post.code_snippet_content = "Failed to load code snippet.";
              }
            }
            return post;
          })
        );

        setPosts(postsWithSnippets);
      } catch (err) {
        console.error(err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    const interval = setInterval(fetchPosts, 5000); 
    return () => clearInterval(interval);

  }, []);


  

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="text-center mb-6"></header>

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

                {post.code_snippet_content && (
                  <div>
                    <p className="text-gray-700 mt-4 mb-2">Code Snippet:</p>
                    <pre className="bg-gray-100 p-4 rounded-lg whitespace-pre-wrap text-gray-800">
                      {post.code_snippet_content}
                    </pre>
                  </div>
                )}

                <button 
                  onClick={() => handleRedirect(post.id)} 
                  className="font-bold text-blue-400 block mt-4"
                >
                  View Post
                </button>
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
