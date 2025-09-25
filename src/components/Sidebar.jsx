import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db, getCurrentUserId } from "../services/firebase";
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { FaCog, FaTimes, FaTrash } from "react-icons/fa";
import "../styles/Sidebar.css";

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([]);
  const [userId, setUserId] = useState(null);
  const [longPressedChat, setLongPressedChat] = useState(null); // store selected chat for delete
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const uid = await getCurrentUserId();
      setUserId(uid);
    };
    fetchUserId();
  }, []);

  const fetchHistory = async () => {
    if (!userId) return;
    try {
      const histQuery = query(
        collection(db, `users/${userId}/history`),
        orderBy("timestamp", "desc")
      );
      const snap = await getDocs(histQuery);
      const history = snap.docs.map(doc => ({
        id: doc.id,
        lastMessage: doc.data().messages?.slice(-1)[0]?.text || "New Chat"
      }));
      setChatHistory(history);
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const handleDeleteChat = async (chatId) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, `users/${userId}/history/${chatId}`));
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      setLongPressedChat(null);
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const startPress = (chatId) => {
    timerRef.current = setTimeout(() => {
      setLongPressedChat(chatId);
    }, 600); // 600ms long press
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="sidebar-overlay" onClick={onClose}></div>

      {/* Sidebar */}
      <div className="sidebar-right show">
        <div className="sidebar-header">
          <span>Chats</span>
          <button className="close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="chat-list">
          {chatHistory.map(chat => (
            <div
              key={chat.id}
              className="chat-line"
              onClick={() => {
                if (longPressedChat !== chat.id) {
                  navigate(`/chat/${chat.id}`);
                }
              }}
              onMouseDown={() => startPress(chat.id)}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={() => startPress(chat.id)}
              onTouchEnd={cancelPress}
            >
              {chat.lastMessage.length > 20
                ? chat.lastMessage.slice(0, 20) + "..."
                : chat.lastMessage}

              {longPressedChat === chat.id && (
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteChat(chat.id)}
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-bottom" onClick={() => navigate("/settings")}>
          <FaCog />
          <span>Settings</span>
        </div>
      </div>
    </>
  );
}
