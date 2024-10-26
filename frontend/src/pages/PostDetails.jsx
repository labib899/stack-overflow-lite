import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PostDetails = () => {
  const { id } = useParams();  // Get the post ID from the URL
  const [post, setPost] = useState(null);  
  const [error, setError] = useState('');  

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get(`http://localhost:8000/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`  
          }
        });
        setPost(response.data);  
      } catch (err) {
        setError('Failed to load post details');
      }
    };

    fetchPost();  
  }, [id]);  

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;  
  }

  if (!post) {
    return <p className="text-gray-500 text-center">Loading...</p>;  
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>  
      <p className="text-gray-700 mb-4">{post.content}</p>   
      {post.code_snippet_url && (
        <div>
          <p className="text-gray-700 mb-4">Code Snippet:</p>
          <a 
            href={post.code_snippet_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-gray-100 p-4 rounded-lg block mb-4 text-blue-500"
          >
            View Code Snippet
          </a>
        </div>
      )}
    </div>
  );
};

export default PostDetails;
