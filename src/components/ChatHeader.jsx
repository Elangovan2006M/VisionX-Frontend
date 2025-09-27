import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { PiNotePencil } from "react-icons/pi";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { createChat } from '../functions/firestore.js';

const ChatHeader = ({ chatName }) => {
  const { isLoggedIn, userId } = useAuth();
  const navigate = useNavigate();

  const handleNewChat = async () => {
    if (!userId) return;
    try {
      const newChatId = await createChat(userId, "New Chat");
      navigate(`/chat/${newChatId}`);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  return (
    <header className="flex items-center justify-between w-full p-3 bg-white dark:bg-black shadow-sm">
      <button className="p-2">
        <FiMenu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
      </button>

      <div className="flex-1 text-center">
        <h1 className="text-lg font-medium text-gray-800 dark:text-gray-100 truncate mx-2">
          {chatName || "New Conversation"}
        </h1>
      </div>

      {isLoggedIn ? (
        <button onClick={handleNewChat} className="p-2">
          <PiNotePencil className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        </button>
      ) : (
        <Link to="/login">
          <button className="px-4 py-2 bg-gray-800 text-white dark:bg-gray-200 dark:text-black rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            Sign In
          </button>
        </Link>
      )}
    </header>
  );
};

export default ChatHeader;

