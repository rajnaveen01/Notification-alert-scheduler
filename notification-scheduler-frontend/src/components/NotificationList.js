import React, { useEffect, useState } from 'react';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/notifications/')
      .then((response) => response.json())
      .then((data) => setNotifications(data));
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>
            <strong>Type:</strong> {notification.type} <br />
            <strong>Message:</strong> {notification.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;
