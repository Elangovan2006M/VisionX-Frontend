import React from "react";

const AiTypingIndicator = ({ text = "Thinking..." }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-xl shadow-md max-w-md">
      {/* Optional GIF */}
      <img
        src="/ai-thinking.gif" 
        alt="Thinking"
        className="h-12 w-12 rounded-full"
      />

      <div className="flex flex-col">
        <span className="text-gray-800 dark:text-gray-100 font-medium">{text}</span>
        <div className="flex space-x-1 mt-1">
          <span className="w-2 h-2 bg-gray-800 dark:bg-gray-100 rounded-full animate-bounce delay-0"></span>
          <span className="w-2 h-2 bg-gray-800 dark:bg-gray-100 rounded-full animate-bounce delay-150"></span>
          <span className="w-2 h-2 bg-gray-800 dark:bg-gray-100 rounded-full animate-bounce delay-300"></span>
        </div>
      </div>
    </div>
  );
};

export default AiTypingIndicator;
