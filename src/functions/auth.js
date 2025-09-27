import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "../services/firebase.js";
import { createUserProfile } from "./firestore.js";

/**
 * Signs up a new user with email and password, and creates their profile.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {object} profileData - Initial data for the user's profile (e.g., { name, city }).
 * @returns {object} The user credential object from Firebase.
 */
export const signUpUser = async (email, password, profileData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Create the user profile document in Firestore
    await createUserProfile(userId, {
      email, // Store email in profile for convenience
      ...profileData,
    });

    return userCredential;
  } catch (error) {
    console.error("Error signing up:", error);
    // You can add more specific error handling here based on error.code
    throw error;
  }
};

/**
 * Signs in an existing user with their email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {object} The user credential object from Firebase.
 */
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

/**
 * Signs out the currently logged-in user.
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
