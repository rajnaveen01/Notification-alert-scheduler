import React from 'react';
import './Popup.css';

const NotificationPopup = ({ type, message, onClose }) => {
  return (
    <div className={`popup ${type.toLowerCase()}`}>
      <h3>{type}</h3>
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default NotificationPopup;
