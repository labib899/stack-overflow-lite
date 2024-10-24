import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { FaRegBell } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";


const NavBar = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreatePost = () => {
    navigate("/create-post");
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  // Fetch notifications when the modal is opened
  const handleNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to load notifications');
    }
    document.getElementById("my_modal_2").showModal(); // Show modal after fetching notifications
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 mb-8 flex justify-between items-center">
      <div className="text-xl font-semibold text-gray-800">
        <img className="w-36" src="/sologo.png"></img>
      </div>
      <div className="space-x-4">
        {/* Notifications Button */}
        <button
          className="btn btn-ghost"
          onClick={handleNotifications}
        >
          <FaRegBell />
        </button>

        {/* Modal for Notifications */}
        <dialog id="my_modal_2" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Notifications</h3>
            <div className="py-4">
              {error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <ul>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <li key={notification._id} className="py-2 border-b">
                        <p className="font-semibold">{notification.message}</p>
                      </li>
                    ))
                  ) : (
                    <p>No notifications to display</p>
                  )}
                </ul>
              )}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>Close</button>
          </form>
        </dialog>

        {/* Create Post Button */}
        <button
          onClick={handleCreatePost}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Create Post
        </button>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="btn"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
