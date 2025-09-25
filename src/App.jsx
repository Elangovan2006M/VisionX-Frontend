import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import SettingsPage from "./pages/SettingsPage";
import { auth } from "./services/firebase";

// This component generates a new chatId and redirects
function NewChatRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const chatId = Date.now().toString();
    navigate(`/chat/${chatId}`);
  }, [navigate]);

  return null;
}

function App() {
  // --- Add mobile/desktop protections ---
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();

    // Disable right-click / long press / copy / cut / paste / text selection
    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("copy", preventDefault);
    document.addEventListener("cut", preventDefault);
    document.addEventListener("paste", preventDefault);
    document.addEventListener("selectstart", preventDefault);
    document.addEventListener("touchstart", preventDefault, { passive: false });

    // Prevent pull-to-refresh on mobile Chrome
    let lastTouchY = 0;
    const preventPullToRefresh = (e) => {
      const touchY = e.touches[0].clientY;
      const touchMove = touchY - lastTouchY;
      lastTouchY = touchY;
      if (window.scrollY === 0 && touchMove > 0) e.preventDefault();
    };
    document.addEventListener("touchstart", (e) => { lastTouchY = e.touches[0].clientY; });
    document.addEventListener("touchmove", preventPullToRefresh, { passive: false });

    return () => {
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("cut", preventDefault);
      document.removeEventListener("paste", preventDefault);
      document.removeEventListener("selectstart", preventDefault);
      document.removeEventListener("touchstart", preventDefault);
      document.removeEventListener("touchstart", (e) => { lastTouchY = e.touches[0].clientY; });
      document.removeEventListener("touchmove", preventPullToRefresh);
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/chat" element={<NewChatRedirect />} /> 
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
