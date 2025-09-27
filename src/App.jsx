import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ChatScreen from './pages/ChatScreen';
import Login from './pages/Login';
import { useAuth } from './contexts/AuthContext.jsx';
import { createChat } from './functions/firestore';

function App() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const setupNewChat = async () => {
      if (!userId) return;

      // Only create a new chat if not already on a chat page
      if (!location.pathname.startsWith('/chat/')) {
        const newChatId = await createChat(userId, 'New Chat');
        navigate(`/chat/${newChatId}`);
      }
    };

    setupNewChat();
  }, [userId, navigate, location.pathname]);

  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/chat/:chatId" element={<ChatScreen />} />
        <Route path="/" element={<ChatScreen />} />
      </Routes>
    </div>
  );
}

export default App;
