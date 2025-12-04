import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./Components/Home";
import Login from "./Components/Login";
import AdminPanel from "./Components/AdminPanel"; // Use AdminPanel as main admin container
import UserPanel from "./Components/UserPanel";
import UserRegistration from "./Components/UserRegistation";
import WhatsAppButton from "./Components/WhatsApp";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<UserRegistration setUser={setUser} />} />

        {user ? (
          user.role === "admin" ? (
            <Route path="/admin/*" element={<AdminPanel user={user} setUser={setUser} />} />
          ) : (
            <Route path="/profile" element={<UserPanel user={user} setUser={setUser} />} />
          )
        ) : (
          <Route path="/*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
       <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <WhatsAppButton/>
    </Router>
  );
}

export default App;
