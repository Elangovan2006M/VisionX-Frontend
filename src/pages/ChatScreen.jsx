import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase.js';
import { uploadImage } from '../services/cloudinary.js';
import { askLLM } from '../services/api.js';
import { saveChatMessage, updateChatName } from '../functions/firestore.js';
import { generateChatName } from '../functions/chatUtils.js';

import ChatHeader from '../components/ChatHeader.jsx';
import MessageList from '../components/MessageList.jsx';
import ChatInput from '../components/ChatInput.jsx';

const ChatScreen = () => {
  const { chatId } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();
    
  const [chatName, setChatName] = useState("New Chat");
  const [isSending, setIsSending] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(false);

  useEffect(() => {
    if (!userId || !chatId) return;

    const chatRef = doc(db, "UserChatHistory", userId, "Chats", chatId);
    const unsubscribe = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setChatName(data.chatName || "Chat");
        if (data.chatName === "New Chat") {
             setIsFirstMessage(true);
        } else {
             setIsFirstMessage(false);
        }
      } else {
        console.error("Chat not found!");
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [userId, chatId, navigate]);

  const handleSendMessage = async ({ text, image }) => {
    if (!userId || !chatId) return;

    setIsSending(true);

    let imageUrl = null;

    if (image) {
      try {
        imageUrl = await uploadImage(image);
      } catch (error) {
        console.error("Image upload failed:", error);
        setIsSending(false);
        return;
      }
    }

    const userMessage = {
      messageType: 'user',
      text: text,
      imageUrl: imageUrl,
    };
    
    await saveChatMessage(userId, chatId, userMessage);
    
    try {
      const llmResponse = await askLLM({ userId, query: text, imageFile: image });
      
      const botMessage = {
        messageType: 'bot',
        text: llmResponse.text || "Sorry, I couldn't process that.",
        imageUrl: null, 
      };

      await saveChatMessage(userId, chatId, botMessage);
      
      if (isFirstMessage) {
        const newName = generateChatName(botMessage.text);
        await updateChatName(userId, chatId, newName);
        setIsFirstMessage(false);
      }

    } catch (error) {
      console.error("LLM API call failed:", error);
      const errorMessage = {
        messageType: 'bot',
        text: "Sorry, something went wrong. Please try again.",
        imageUrl: null,
      };
      await saveChatMessage(userId, chatId, errorMessage);
    } finally {
      setIsSending(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-black">
      <ChatHeader chatName={chatName} />
      <MessageList />
      <ChatInput isSending={isSending} setIsSending={setIsSending} />    
    </div>
  );
};

export default ChatScreen;

