import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "/src/contexts/AuthContext.jsx";
import { useLanguage } from "/src/contexts/LanguageContext.jsx";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "/src/services/firebase.js";
import { UserMessage, LlmResponse } from "/src/components/Message.jsx";
import { formatDateSeparator, speakTTS, stopTTS, detectLanguage } from "/src/functions/chatUtils.js";
import { handleThumb } from "../functions/firestore";

const MessageList = () => {
  const { chatId } = useParams();
  const { userId } = useAuth();
  const { language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!userId || !chatId) return;

    const messagesRef = collection(db, "UserChatHistory", userId, "Chats", chatId, "Messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let lastDate = null;
      const msgs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const message = {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
          thumbs: data.thumbs || { up: false, down: false },
          imageUrl: data.imageUrl || null,
        };
        const messageDate = formatDateSeparator(message.timestamp);
        if (messageDate !== lastDate) {
          msgs.push({ id: `sep-${messageDate}`, type: "separator", date: messageDate });
          lastDate = messageDate;
        }
        msgs.push(message);
      });
      setMessages(msgs);
    });

    return () => {
      unsubscribe();
      stopTTS();
    };
  }, [userId, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSpeak = (message) => {
    const content = message.answer || message.text || "";
    if (speakingMessageId === message.id) {
      stopTTS();
      setSpeakingMessageId(null);
    } else {
      speakTTS({
        text: content,
        lang: detectLanguage(content) || language,
        onStart: () => setSpeakingMessageId(message.id),
        onEnd: () => setSpeakingMessageId(null),
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((msg) => {
        if (msg.type === "separator") {
          return (
            <div key={msg.id} className="text-center my-4">
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {msg.date}
              </span>
            </div>
          );
        }

        if (msg.messageType === "user") {
          return <UserMessage key={msg.id} message={msg} />;
        } else if (msg.messageType === "bot") {
          return (
            <LlmResponse
              key={msg.id}
              message={msg}
              onSpeak={() => handleSpeak(msg)}
              onVote={(newThumbs) => handleThumb(userId, chatId, msg.id, newThumbs)}
            />
          );
        }

        return null;
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
