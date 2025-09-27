import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiCamera, FiFile, FiX } from 'react-icons/fi';
import { RiMic2AiLine } from "react-icons/ri";
import { IoSend, IoEllipsisVertical } from "react-icons/io5";
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { startSTT, detectLanguage } from '../functions/chatUtils.js';
import { playClingSound } from '../functions/soundUtils.js';
import { askLLM } from '../services/api.js';
import { saveChatMessage } from '../functions/firestore';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useParams } from 'react-router-dom';
import { uploadImage } from '../services/cloudinary.js';

const ChatInput = ({ isSending, setIsSending }) => {
  const { chatId } = useParams();
  const { userId } = useAuth();
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showAttachmentButtons, setShowAttachmentButtons] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const listeningTimeoutRef = useRef(null);
  const { language, t } = useLanguage();

  const stopListening = () => {
    if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    setIsListening(false);
  };

  const handleSttClick = () => {
    playClingSound();
    if (isListening) {
      recognitionRef.current?.stop();
      stopListening();
      return;
    }
    setIsListening(true);
    const langCode = detectLanguage(text) || language;
    recognitionRef.current = startSTT({
      lang: langCode,
      onResult: (transcript) => setText(prev => prev + transcript),
      onError: (err) => console.error(err),
      onEnd: stopListening,
    });
    listeningTimeoutRef.current = setTimeout(() => {
      recognitionRef.current?.stop();
    }, 15000);
  };

  const handleSend = async () => {
    if ((!text.trim() && !imageFile) || !userId || !chatId) return;
    setIsSending(true);

    let uploadedImageUrl = null;
    if (imageFile) {
      try {
        uploadedImageUrl = await uploadImage(imageFile);
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }

    await saveChatMessage(userId, chatId, {
      messageType: 'user',
      text,
      imageUrl: uploadedImageUrl,
    });

    try {
      const response = await askLLM({ userId, query: text, imageFile });
      await saveChatMessage(userId, chatId, {
        messageType: 'bot',
        text: response.answer,
        imageUrl: response.imageUrl || null,
      });
    } catch (err) {
      console.error(err);
      await saveChatMessage(userId, chatId, {
        messageType: 'bot',
        text: "Sorry, something went wrong.",
        imageUrl: null,
      });
    }

    setText('');
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setIsSending(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      event.target.value = null;
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    };
  }, [imagePreview]);

  return (
    <div className="p-2 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
      {imagePreview && (
        <div className="relative inline-block m-2">
          <img src={imagePreview} alt="Selected preview" className="h-24 w-auto rounded-lg object-cover" />
          <button onClick={removeImage} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/75">
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col p-2 border border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-100 dark:bg-gray-900">
        <textarea
          rows="1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder={t.askPlaceholder || "Ask something ..."}
          className="w-full bg-transparent resize-none focus:outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 max-h-24 py-2"
        />
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center gap-1">
            <button onClick={() => setShowAttachmentButtons(!showAttachmentButtons)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              <FiPlus className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div className={`flex items-center gap-1 transition-all duration-300 ease-in-out overflow-hidden ${showAttachmentButtons ? 'max-w-xs' : 'max-w-0'}`}>
              <button onClick={() => cameraInputRef.current.click()} className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-opacity ${showAttachmentButtons ? 'opacity-100' : 'opacity-0'}`}>
                <FiCamera className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <button onClick={() => fileInputRef.current.click()} className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-opacity ${showAttachmentButtons ? 'opacity-100' : 'opacity-0'}`}>
                <FiFile className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleSttClick} className={`p-2 rounded-full transition-colors ${isListening ? 'bg-green-500/20' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
              <RiMic2AiLine className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
            {(text.trim() || imageFile) ? (
              <button onClick={handleSend} disabled={isSending} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <IoSend className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            ) : (
              <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <IoEllipsisVertical className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
    </div>
  );
};

export default ChatInput;
