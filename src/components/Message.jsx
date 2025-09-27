import React, { useState } from 'react';
import { FiCopy, FiThumbsUp, FiThumbsDown, FiVolume2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "/src/services/firebase.js";

// -- User Message Component --
export const UserMessage = ({ message }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const lineCount = message.text?.split('\n').length || 1;
  const isLong = message.text?.length > 200 || lineCount > 4;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
  };

  return (
    <div className="flex justify-end my-2">
      <div className="relative group max-w-xl flex items-start gap-2">
        <button
          onClick={handleCopy}
          className="mt-2 p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <FiCopy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="relative px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          {message.imageUrl && <img src={message.imageUrl} alt="User upload" className="rounded-lg mb-2 max-w-xs" />}

          <div className={`whitespace-pre-wrap ${!isExpanded && isLong ? 'max-h-24 overflow-hidden' : ''}`}>
             {message.text}
          </div>

          {isLong && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="absolute top-1 right-2 p-1">
              {isExpanded ? <FiChevronUp className="h-5 w-5 text-gray-500" /> : <FiChevronDown className="h-5 w-5 text-gray-500" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


// -- LLM Response Component --
export const LlmResponse = ({ message, onSpeak, onVote }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.answer);
  };

  const handleClick = (type) => {
    // If clicking the same type, toggle off; else set type true and other false
    const newUp = type === 'up' ? !message.thumbs?.up : false;
    const newDown = type === 'down' ? !message.thumbs?.down : false;

    onVote({ up: newUp, down: newDown });
  };

  return (
    <div className="flex my-2">
      <div className="w-full">
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="LLM response"
            className="rounded-lg mb-2 max-w-md"
          />
        )}
        <div className="max-w-none text-gray-900 dark:text-gray-100">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.answer}
          </ReactMarkdown>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleClick('up')}
            className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
              message.thumbs?.up ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <FiThumbsUp className="h-5 w-5" />
          </button>

          <button
            onClick={() => handleClick('down')}
            className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
              message.thumbs?.down ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <FiThumbsDown className="h-5 w-5" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <FiCopy className="h-5 w-5" />
          </button>
          <button
            onClick={() => onSpeak(message)}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <FiVolume2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
