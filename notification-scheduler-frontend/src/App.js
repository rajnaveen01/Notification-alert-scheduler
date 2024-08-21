import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NotificationForm from './components/NotificationForm';
import NotificationList from './components/NotificationList';
import EndUser from './EndUser';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/notification-form" element={<NotificationForm />} />
        <Route path="/notification-list" element={<NotificationList />} />
        <Route path="/end-user" element={<EndUser />} />
      </Routes>
    </Router>
  );
};

export default App;
