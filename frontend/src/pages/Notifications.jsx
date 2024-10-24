import React, { useEffect, useState } from 'react';
import axios from 'axios';


const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('/notifications', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure the token is stored correctly
                    }
                });
                setNotifications(response.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching notifications: ' + err.response?.data?.detail || err.message);
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="notifications-container">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
                <p>No notifications available</p>
            ) : (
                notifications.map(notification => (
                    <div key={notification._id} className="notification-card">
                        <p><strong>Message:</strong> {notification.message}</p>
                        <p><strong>Post ID:</strong> {notification.post_id}</p>
                        <p><strong>Created At:</strong> {new Date(notification.created_at).toLocaleString()}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default Notifications;
