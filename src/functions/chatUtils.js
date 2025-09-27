/**
 * Cleans response text by trimming whitespace but preserving newlines.
 * @param {string} text - The input text.
 * @returns {string} The cleaned text.
 */
export const cleanResponse = (text) => {
  if (!text) return "";
  return text.trim();
};

/**
 * Generates a short, suitable title from an AI's response text.
 * @param {string} aiResponse - The full text response from the AI.
 * @returns {string} A short title, e.g., the first 5 words.
 */
export const generateChatName = (aiResponse) => {
  if (!aiResponse) return "New Chat";
  const cleaned = cleanResponse(aiResponse).split("\n")[0]; // Use first line
  const words = cleaned.split(" ");
  if (words.length > 5) {
    return words.slice(0, 5).join(" ") + "...";
  }
  return cleaned;
};

/**
 * Detects the language of a given text among English, Malayalam, and Tamil.
 * @param {string} text - The text to analyze.
 * @returns {string} The corresponding language code ('en-US', 'ml-IN', 'ta-IN').
 */
export const detectLanguage = (text) => {
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta-IN"; // Tamil script range
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml-IN"; // Malayalam script range
  return "en-US"; // Default to English
};

// --- Web Speech API Utilities ---

/**
 * Starts speech-to-text recognition.
 * @param {object} options - Configuration for STT.
 * @param {function} options.onResult - Callback with the final transcript.
 * @param {function} options.onError - Callback for any recognition errors.
 * @param {string} [options.lang='en-US'] - Language for recognition.
 * @returns {SpeechRecognition | null} The recognition instance to be stored in a ref.
 */
export const startSTT = ({ onResult, onError, lang = "en-US" }) => {
  if (!("webkitSpeechRecognition" in window)) {
    onError(new Error("Speech recognition is not supported by this browser."));
    return null;
  }
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => onResult(event.results[0][0].transcript);
  recognition.onerror = (event) => onError(event.error);

  recognition.start();
  return recognition;
};

/**
 * Speaks a given text using the browser's text-to-speech engine.
 * @param {object} options - Configuration for TTS.
 * @param {string} options.text - The text to be spoken.
 * @param {string} [options.lang='en-US'] - Language for the voice.
 * @param {function} [options.onStart] - Callback invoked when speech begins.
 * @param {function} [options.onEnd] - Callback invoked when speech ends or fails.
 */
export const speakTTS = ({ text, lang = "en-US", onStart, onEnd }) => {
  if (!text || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }
  // Stop any currently speaking utterance before starting a new one
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;

  // Use callbacks to manage state (like `isSpeaking`) in your component
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  speechSynthesis.speak(utterance);
};

/**
 * Immediately stops any ongoing text-to-speech playback.
 */
export const stopTTS = () => {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
};


export const formatDateSeparator = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return null;

  const date = timestamp.toDate();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday = date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};