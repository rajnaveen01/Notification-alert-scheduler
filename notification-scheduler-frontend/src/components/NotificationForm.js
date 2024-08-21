import React, { useState } from 'react';

const NotificationForm = () => {
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:8000/notifications/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        message,
        recipient_email: recipientEmail,
        scheduled_time: scheduledTime,
      }),
    }).then(() => {
      setType('');
      setMessage('');
      setRecipientEmail('');
      setScheduledTime('');
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Notification</h2>
      <label>
        Type:
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Select Type of Message</option>
          <option value="WelcomeEmail">Welcome Email</option>
          <option value="Alert">Alert</option>
          <option value="Reminder">Reminder</option>
          <option value="Promotional">Promotional</option>
          <option value="Transactional">Transactional</option>
        </select>
      </label>
      <br />
      <label>
        Message:
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      <br />
      <label>
        Recipient Email:
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
      </label>
      <br />
      <label>
        Scheduled Time:
        <input
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
        />
      </label>
      <br />
      <button type="submit">Create Notification</button>
    </form>
  );
};

export default NotificationForm;
