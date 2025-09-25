import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  deleteUser,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpYNCF62T1C_NgeCPIxjPfMYOPW1gmx30",
  authDomain: "agri-65800.firebaseapp.com",
  projectId: "agri-65800",
  storageBucket: "agri-65800.firebasestorage.app",
  messagingSenderId: "352642218983",
  appId: "1:352642218983:web:8fd93e07bb847d1fd05b42"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

// Persist login across browser sessions
setPersistence(auth, browserLocalPersistence);

// Get current user ID
export const getCurrentUserId = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user ? user.uid : null);
    });
  });

// Get current user email
export const getCurrentUserEmail = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user ? user.email : null);
    });
  });

// Get chat history
export const getUserChatHistory = async (userId) => {
  if (!userId) return [];
  try {
    const historyRef = collection(db, `users/${userId}/history`);
    const q = query(historyRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const chats = snapshot.docs.map((doc) => ({ chatId: doc.id, ...doc.data() }));
    return chats;
  } catch (err) {
    console.error("Error fetching user chat history:", err);
    return [];
  }
};

// Delete current user account
export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  try {
    await deleteUser(user);
    return true;
  } catch (err) {
    console.error("Delete user failed:", err);
    throw err;
  }
};

// Send password reset email to current user
export const sendPasswordResetEmailForCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("No user logged in");
  try {
    await sendPasswordResetEmail(auth, user.email);
    return true;
  } catch (err) {
    console.error("Password reset email failed:", err);
    throw err;
  }
};
