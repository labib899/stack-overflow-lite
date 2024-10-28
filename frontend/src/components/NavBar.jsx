import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { FaRegBell } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import { FaHome } from "react-icons/fa";

const NavBar = () => {
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const lastNotificationId = useRef(localStorage.getItem("lastNotificationId"));
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const storedUserEmail = localStorage.getItem("userEmail");
    if (storedUserEmail) setUserEmail(storedUserEmail);

    const currentUserId = localStorage.getItem("userId");
    if (currentUserId) setCurrentUserId(currentUserId);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8000/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.length > 0) {
          const newLastNotificationId =
            response.data[0].id; 

          if (
            lastNotificationId.current &&
            newLastNotificationId > lastNotificationId.current
          ) {
            setHasNewNotifications(true); 
          }
          lastNotificationId.current = newLastNotificationId; 
          localStorage.setItem("lastNotificationId", newLastNotificationId);
        }

        setNotifications(response.data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreatePost = () => {
    navigate("/create-post");
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("lastNotificationId");
    navigate("/signin");
  };

  // Fetch notifications and open the modal
  const handleNotifications = () => {
    setHasNewNotifications(false);
    document.getElementById("my_modal_2").showModal();
  };

  const handleRedirect = async (notification) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8000/notifications/${notification.id}/mark-as-read`,
        { userId: currentUserId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update notifications state to mark the notification as read
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === notification.id
            ? { ...notif, seen_id: [...notif.seen_id, currentUserId] }
            : notif
        )
      );

      // Navigate to the post after marking as read
      navigate(`/post-details/${notification.post_id}`);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 mb-8 flex justify-between items-center">
      <div className="text-xl font-semibold text-gray-800">
        <img className="w-36" src="/sologo.png" alt="Logo" />
      </div>

      <div className="space-x-4">
        <span className="text-gray-800 font-semibold">{userEmail}</span>

        <button onClick={handleHome} className="btn btn-ghost">
          <FaHome />
        </button>

        {/* Notifications Button with Red Sign */}
        <div className="relative inline-block">
          <button className="btn btn-ghost" onClick={handleNotifications}>
            <FaRegBell />
            {hasNewNotifications && (
              <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </button>
        </div>

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
                      <li key={notification.id}>
                        <button
                          onClick={() => handleRedirect(notification)}
                          className={`py-2 border-b ${
                            notification.seen_id.includes(currentUserId)
                              ? "text-gray-500" 
                              : "font-semibold text-black" 
                          }`}
                        >
                          <p>{notification.message}</p>
                        </button>
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

        <button
          onClick={handleCreatePost}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Create Post
        </button>

        <button onClick={handleSignOut} className="btn">
          <FaSignOutAlt />
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
