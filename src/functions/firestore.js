import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../services/firebase.js";

// --- User Profile Functions ---

/**
 * Creates or overwrites a user's profile.
 * @param {string} userId - The user's unique ID.
 * @param {object} profileData - Data for the profile (name, mobile, city, state).
 */
export const createUserProfile = (userId, profileData) => {
  const userProfileRef = doc(db, "UserProfile", userId);
  return setDoc(userProfileRef, profileData);
};

/**
 * Retrieves a user's profile data.
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<object|null>} The user's profile data or null if not found.
 */
export const getUserProfile = (userId) => {
  const userProfileRef = doc(db, "UserProfile", userId);
  return getDoc(userProfileRef);
};

/**
 * Updates specific fields in a user's profile.
 * @param {string} userId - The user's unique ID.
 * @param {object} updatedData - The fields to update.
 */
export const updateUserProfile = (userId, updatedData) => {
  const userProfileRef = doc(db, "UserProfile", userId);
  return updateDoc(userProfileRef, updatedData);
};

/**
 * Deletes a user's entire profile document.
 * @param {string} userId - The user's unique ID.
 */
export const deleteUserProfile = (userId) => {
  const userProfileRef = doc(db, "UserProfile", userId);
  return deleteDoc(userProfileRef);
};

// --- User Chat History Functions ---

/**
 * Creates a new chat session for a user.
 * @param {string} userId - The user's unique ID.
 * @param {string} chatName - The initial name for the chat.
 * @returns {Promise<string>} The ID of the newly created chat.
 */
export const createChat = async (userId, chatName) => {
  const historyCollectionRef = collection(db, "UserChatHistory", userId, "Chats");
  const newChatRef = await addDoc(historyCollectionRef, {
    chatName: chatName,
    createdAt: serverTimestamp(),
  });
  return newChatRef.id;
};

/**
 * Retrieves a user's entire chat history (list of chats).
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<Array>} A list of chat sessions.
 */
export const getChatHistory = async (userId) => {
  const historyCollectionRef = collection(db, "UserChatHistory", userId, "Chats");
  const q = query(historyCollectionRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Saves a new message to a specific chat, now with image URL support.
 * @param {string} userId - The user's unique ID.
 * @param {string} chatId - The chat's unique ID.
 * @param {object} messageData - The message object (may include text and imageUrl).
 */
export const saveChatMessage = (userId, chatId, messageData) => {
  const messagesCollectionRef = collection(
    db,
    "UserChatHistory",
    userId,
    "Chats",
    chatId,
    "Messages"
  );

  let normalizedMessage = {
    timestamp: serverTimestamp(),
  };

  if (messageData.messageType === "user") {
    // User message
    normalizedMessage = {
      messageType: "user",
      text: messageData.text || "",
      imageUrl: messageData.imageUrl || null,
      timestamp: serverTimestamp(),
    };
  } else {
  normalizedMessage = {
    messageType: "bot",
    answer: messageData.answer || messageData.text || "Sorry",
    imageUrl: messageData.imageUrl || null,
    timestamp: serverTimestamp(),
    thumbs: { up: false, down: false }
  };
}
  return addDoc(messagesCollectionRef, normalizedMessage);
};

export const handleThumb = async (userId, chatId, messageId, thumbs) => {
  const messageRef = doc(db, "UserChatHistory", userId, "Chats", chatId, "Messages", messageId);
  await updateDoc(messageRef, {
    thumbs: thumbs
  });
};


/**
 * Updates the name of a chat session.
 * @param {string} userId - The user's unique ID.
 * @param {string} chatId - The chat's unique ID.
 * @param {string} newName - The new name for the chat.
 */
export const updateChatName = (userId, chatId, newName) => {
  const chatDocRef = doc(db, "UserChatHistory", userId, "Chats", chatId);
  return updateDoc(chatDocRef, { chatName: newName });
};

/**
 * Deletes a chat and all of its messages.
 * @param {string} userId - The user's unique ID.
 * @param {string} chatId - The chat's unique ID.
 */
export const deleteChat = async (userId, chatId) => {
  const messagesCollectionRef = collection(
    db,
    "UserChatHistory",
    userId,
    "Chats",
    chatId,
    "Messages"
  );
  const messagesSnapshot = await getDocs(messagesCollectionRef);

  const batch = writeBatch(db);
  messagesSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  const chatDocRef = doc(db, "UserChatHistory", userId, "Chats", chatId);
  return deleteDoc(chatDocRef);
};


// --- Officer Contact Functions ---

/**
 * Gets officer contacts for a specific state and city.
 * @param {string} stateName - The name of the state.
 * @param {string} cityName - The name of the city.
 * @returns {Promise<Array>} A list of officer contacts.
 */
export const getOfficerContacts = async (stateName, cityName) => {
  const cityDocRef = doc(db, "OfficerContacts", stateName, "cities", cityName);
  const officersCollectionRef = collection(cityDocRef, "officers");
  const snapshot = await getDocs(officersCollectionRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

