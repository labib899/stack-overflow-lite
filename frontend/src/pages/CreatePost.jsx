import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

const CreatePost = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [codeSnippet, setCodeSnippet] = useState("");
    const [language, setLanguage] = useState("");
    const [file, setFile] = useState(null);
    const [uploadMode, setUploadMode] = useState("none");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();

            // Append common fields
            formData.append("title", title);
            formData.append("content", content);

            // Append code snippet or file based on selected mode
            if (uploadMode === "codeSnippet" && codeSnippet) {
                formData.append("code_snippet", codeSnippet);
                formData.append("language", language);
            } else if (uploadMode === "file" && file) {
                formData.append("file", file);
            }

            const response = await axios.post(`${baseURL}/posts`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                const postId = response.data.post_id;
                // creating notification
                await axios.post(
                    `${baseURL}/notifications/${postId}`,
                    { post_id: postId },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setSuccess("Post created successfully!");
                setTitle("");
                setContent("");
                setCodeSnippet("");
                setLanguage("");
                setFile(null);
                setUploadMode("none");
                setTimeout(() => navigate("/"), 1500);
            }
        } catch (err) {
            setError("Failed to create post. Please try again.");
            console.error(err.response ? err.response.data : err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
            <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Create a New Post
                </h2>

                {error && <p className="text-red-500 mb-4">{error}</p>}
                {success && <p className="text-green-500 mb-4">{success}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Post Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="content"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Content
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            rows="4"
                            required
                        ></textarea>
                    </div>

                    {/* Radio buttons for upload mode */}
                    <div className="flex flex-col">
                        <span className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Mode (Optional)
                        </span>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="none"
                                checked={uploadMode === "none"}
                                onChange={() => setUploadMode("none")}
                                className="mr-2"
                            />
                            None
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="codeSnippet"
                                checked={uploadMode === "codeSnippet"}
                                onChange={() => setUploadMode("codeSnippet")}
                                className="mr-2"
                            />
                            Code Snippet
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="file"
                                checked={uploadMode === "file"}
                                onChange={() => setUploadMode("file")}
                                className="mr-2"
                            />
                            File Upload
                        </label>
                    </div>

                    {uploadMode === "codeSnippet" && (
                        <>
                            <div>
                                <label
                                    htmlFor="codeSnippet"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Code Snippet
                                </label>
                                <textarea
                                    id="codeSnippet"
                                    value={codeSnippet}
                                    onChange={(e) =>
                                        setCodeSnippet(e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-48"
                                    rows="4"
                                    placeholder="Enter code snippet here (optional)"
                                    required
                                ></textarea>
                            </div>

                            {/* Language Dropdown */}
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md"
                                required={uploadMode === "codeSnippet"} // Language is required if codeSnippet is selected
                            >
                                <option value="">Select Language</option>
                                <option value="Python">Python</option>
                                <option value="Javascript">JavaScript</option>
                                <option value="C++">C++</option>
                                <option value="C">C</option>
                                <option value="Java">Java</option>
                            </select>
                        </>
                    )}

                    {uploadMode === "file" && (
                        <div>
                            <label
                                htmlFor="file"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Upload File
                            </label>
                            <input
                                type="file"
                                id="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                    >
                        Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
