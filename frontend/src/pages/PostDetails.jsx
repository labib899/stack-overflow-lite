import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PostDetails = () => {
  const { id } = useParams();  // Get the post ID from the URL
  const [post, setPost] = useState(null);  // State to store post details
  const [error, setError] = useState('');  // State to store any error

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');  // Get token if needed for authorization
        const response = await axios.get(`http://localhost:8000/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`  // Include token in the request headers
          }
        });
        setPost(response.data);  // Set the fetched post data
      } catch (err) {
        setError('Failed to load post details');
      }
    };

    fetchPost();  // Fetch the post when component mounts
  }, [id]);  // Dependency array includes 'id' to refetch if the id changes

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;  // Display error if occurs
  }

  if (!post) {
    return <p className="text-gray-500 text-center">Loading...</p>;  // Display loading message while fetching
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>  
      <p className="text-gray-700">{post.content}</p>  
    </div>
  );
};

export default PostDetails;
