import React, { useState, useEffect } from 'react';
import NotificationPopup from './components/NotificationPopup';
import './EmailStyle.css';

const EndUser = () => {
  const [notifications, setNotifications] = useState([]);
  const [popupNotification, setPopupNotification] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/user@example.com');

    socket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      setPopupNotification(data);
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/user-notifications/user@example.com')
      .then((response) => response.json())
      .then((data) => setNotifications(data));
  }, []);

  const simulateNotification = () => {
    setPopupNotification({
      type: 'Reminder',
      message: 'This is a test reminder notification',
    });
  };

  return (
    <div className="email-container">
      <h2>Your Notifications</h2>
      <button onClick={simulateNotification}>Simulate Notification</button>
      <ul className="notification-list">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <strong>Type:</strong> {notification.type} <br />
            <strong>Message:</strong> {notification.message}
          </li>
        ))}
      </ul>
      {popupNotification && (
        <NotificationPopup
          type={popupNotification.type}
          message={popupNotification.message}
          onClose={() => setPopupNotification(null)}
        />
      )}
    </div>
  );
};

export default EndUser;
