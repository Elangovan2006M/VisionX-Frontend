// src/pages/ChatPage.jsx
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { askLLM } from "../services/api";
import { FaPlus, FaMicrophone, FaPaperPlane } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";
import { BiLike, BiDislike } from "react-icons/bi";
import { LuVolume2, LuVolumeOff } from "react-icons/lu";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, getCurrentUserId } from "../services/firebase";
import { uploadImage } from "../services/cloudinary";
import Sidebar from "../components/Sidebar";
import "../styles/ChatPage.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import logo from "../asset/image.png";


function ChatPage() {
  const { chatId } = useParams();
  const [userId, setUserId] = useState(null);
  const [queryText, setQueryText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // --- Load voices for TTS ---
  useEffect(() => {
    const loadVoices = () => setVoices(speechSynthesis.getVoices());
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // --- Unlock speech on first tap ---
  useEffect(() => {
    const unlock = () => {
      const u = new SpeechSynthesisUtterance("");
      speechSynthesis.speak(u);
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("click", unlock);
    return () => window.removeEventListener("click", unlock);
  }, []);

  // --- Fetch current user ID ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const uid = await getCurrentUserId();
        setUserId(uid);
      } catch (err) {
        console.error("Failed to get user ID:", err);
      }
    };
    fetchUser();
  }, []);

  // --- Fetch chat messages ---
  useEffect(() => {
    const fetchChat = async () => {
      if (!chatId || !userId) return;
      try {
        const chatDoc = doc(db, `users/${userId}/history/${chatId}`);
        const snap = await getDoc(chatDoc);
        if (snap.exists()) setMessages(snap.data().messages || []);
        else await setDoc(chatDoc, { messages: [], timestamp: Date.now() });
      } catch (err) {
        console.error("Firebase fetch failed:", err);
      }
    };
    fetchChat();
  }, [chatId, userId]);

  // --- Scroll to bottom when messages update ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Save message ---
  const saveMessage = async (msg) => {
    if (!chatId || !userId) return;
    try {
      const chatDoc = doc(db, `users/${userId}/history/${chatId}`);
      const snap = await getDoc(chatDoc);
      const existingMessages = snap.exists() ? snap.data().messages || [] : [];
      await setDoc(
        chatDoc,
        { messages: [...existingMessages, msg], timestamp: Date.now() },
        { merge: true }
      );
    } catch (err) {
      console.error("Firebase save failed:", err);
    }
  };

  // --- Clean response text ---
  const cleanResponse = (text) => {
    if (!text) return "";
    return text.trim(); // keep \n and *
  };


  // --- Detect only English vs Malayalam ---
  const detectLanguage = (text) => {
    if (/[\u0D00-\u0D7F]/.test(text)) return "ml-IN"; // Malayalam script
    return "en-US"; // Default English
  };

  // --- Send message ---
  const handleSend = async () => {
    if (!queryText.trim() && !image) return;

    let imageUrl = null;
    if (image) {
      try {
        imageUrl = await uploadImage(image);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }

    const newMessage = {
      id: Date.now(),
      type: "user",
      text: queryText,
      image: imageUrl,
      timestamp: new Date().toISOString(),
      thumbsUp: null,
    };

    setMessages((prev) => [...prev, newMessage]);
    saveMessage(newMessage);
    setQueryText("");
    setImage(null);
    setImagePreview(null);
    setLoading(true);

    try {
      const sourceLang = detectLanguage(newMessage.text || "");

      const response = await askLLM({
        userId,
        query: newMessage.text,
        imageFile: image,
        sourceLang, // auto-detected
      });

      const botText = cleanResponse(response.answer || "No answer received");
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        text: botText,
        image: newMessage.image,
        timestamp: new Date().toISOString(),
        thumbsUp: null,
      };
      setMessages((prev) => [...prev, botMessage]);
      saveMessage(botMessage);
    } catch (err) {
      console.error("LLM request failed:", err);
      const errorMsg = {
        id: Date.now() + 2,
        type: "bot",
        text: "Error: Unable to get response",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // --- File upload ---
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // --- Speech-to-text ---
  const handleStartSTT = () => {
    if (!("webkitSpeechRecognition" in window)) return;
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = false;

    // Detect language dynamically from query so far (default en-US)
    const userLang = detectLanguage(queryText || "");
    recognitionRef.current.lang = userLang;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQueryText(transcript);
    };
    recognitionRef.current.start();
  };

  // --- Text-to-speech ---
  const toggleTTS = (text) => {
    if (!text) return;

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utter = new SpeechSynthesisUtterance(text);
    const targetLang = detectLanguage(text);

    const voice =
      voices.find((v) => v.lang === targetLang) ||
      voices.find((v) => v.lang.startsWith(targetLang.split("-")[0])) ||
      voices.find((v) => v.lang.startsWith("en"));
    if (voice) utter.voice = voice;

    utter.lang = targetLang;
    utter.onend = () => setIsSpeaking(false);

    speechSynthesis.speak(utter);
    setIsSpeaking(true);
  };

  // --- Thumbs ---
  const handleThumbs = (msgId, value) =>
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, thumbsUp: value } : msg
      )
    );

  return (
    <div className="chat-page">
      <div className="top-bar">
        <img src={logo} alt="VisionX Logo" className="app-logo" />
        <h2>VisionX</h2>
        <button
          className="menu-btn"
          onClick={() => setShowSidebar((prev) => !prev)}
        >
          <IoMdMore />
        </button>
      </div>

      <div className="main-container">
        <div className="chat-container">
          <div className="chat-window">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.type}`}>
                {msg.image && (
                  <img src={msg.image} alt="upload" className="chat-image" />
                )}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({node, ...props}) => <p className="message-text" {...props} />,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>

                {msg.type === "bot" && (
                  <div className="bot-actions">
                    <div className="thumbs-container">
                      <button
                        className={`thumb-btn ${
                          msg.thumbsUp === true ? "active" : ""
                        }`}
                        onClick={() => handleThumbs(msg.id, true)}
                      >
                        <BiLike />
                      </button>
                      <button
                        className={`thumb-btn ${
                          msg.thumbsUp === false ? "active" : ""
                        }`}
                        onClick={() => handleThumbs(msg.id, false)}
                      >
                        <BiDislike />
                      </button>
                    </div>
                    <button
                      className="volume-btn"
                      onClick={() => toggleTTS(msg.text)}
                    >
                      {isSpeaking ? <LuVolumeOff /> : <LuVolume2 />}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble bot">
                <p>Thinking...</p>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-area">
            <label htmlFor="file-upload" className="icon-btn">
              <FaPlus />
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            {imagePreview && (
              <div className="image-preview-wrapper">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="input-image-preview"
                />
                <button
                  className="remove-image-btn"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  x
                </button>
              </div>
            )}

            <div className="input-preview-container">
              <textarea
                className="chat-input"
                placeholder="Type or speak..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                rows="1"
              />
            </div>
            <button className="icon-btn" onClick={handleStartSTT}>
              <FaMicrophone />
            </button>
            <button className="send-btn" onClick={handleSend}>
              <FaPaperPlane />
            </button>
          </div>
        </div>

        {showSidebar && <Sidebar onClose={() => setShowSidebar(false)} />}
      </div>
    </div>
  );
}

export default ChatPage;
