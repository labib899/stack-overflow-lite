import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';


const PostDetails = () => {
  const { id } = useParams();  
  const [post, setPost] = useState(null);
  const [codeSnippet, setCodeSnippet] = useState('');  
  const [poster, setPoster] = useState(null);
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
        console.log(response.data);


        const userResponse = await axios.get(`http://localhost:8000/users/${response.data.user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPoster(userResponse.data); 


        if (response.data.code_snippet_url) {
          const snippetResponse = await axios.get(response.data.code_snippet_url, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log(snippetResponse);
          setCodeSnippet(snippetResponse.data); 
        }
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
      {/* Display the poster's information */}
      {poster && (
        <p className="text-gray-500 mb-4">
          Posted by: <span className="font-semibold">{poster.email}</span>
        </p>
      )}

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-700 mb-4">{post.content}</p>
      
      {codeSnippet && (
        <div>
          <p className="text-gray-700 mb-4">Code Snippet:</p>
          <pre className="bg-gray-100 p-4 rounded-lg mb-4 whitespace-pre-wrap text-gray-800">
            {codeSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PostDetails;
