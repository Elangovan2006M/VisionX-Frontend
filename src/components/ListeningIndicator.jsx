import React from 'react';

const ListeningIndicator = () => {
  return (
    <div className="flex-1 flex justify-center items-center space-x-1 h-10">
      <span className="w-1 h-2 bg-green-500 rounded-full animate-wave" style={{ animationDelay: '0.1s' }}></span>
      <span className="w-1 h-3 bg-green-500 rounded-full animate-wave" style={{ animationDelay: '0.2s' }}></span>
      <span className="w-1 h-5 bg-green-500 rounded-full animate-wave" style={{ animationDelay: '0.3s' }}></span>
      <span className="w-1 h-6 bg-green-500 rounded-full animate-wave" style={{ animationDelay: '0.4s' }}></span>
      <span className="w-1 h-5 bg-green-500 rounded-full animate-wave" style={{ animationDelay: '0.5s' }}></span>
      <span className="w-1 h-3 bg-green-500 rounded-full animate-wave" style={{ animationDelay: '0.6s' }}></span>
      <span className="w-1 h-2 bg-green-500 rounded-full animate-wave" style={{ animationDelay: '0.7s' }}></span>
    </div>
  );
};

export default ListeningIndicator;

