import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext.jsx";
import { createUserProfile } from "../functions/firestore.js";

const LoginPage = () => {
  const { login, logout, userId, isLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let userCredential;
      if (isRegister) {
        // Register new user
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create profile in Firestore
        await createUserProfile(userCredential.user.uid, {
          name: name || "New User",
          email,
        });
      } else {
        // Login existing user
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      // Update AuthContext
      login(userCredential.user.uid);
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-black">
      {!isLoggedIn ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md w-80"
        >
          <h1 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            {isRegister ? "Register" : "Login"}
          </h1>

          {isRegister && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-3 p-2 border rounded"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
            required
          />

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {isRegister ? "Register" : "Login"}
          </button>

          <p
            onClick={() => setIsRegister(!isRegister)}
            className="mt-3 text-sm text-blue-600 cursor-pointer"
          >
            {isRegister ? "Already have an account? Login" : "Need an account? Register"}
          </p>
        </form>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-gray-800 dark:text-gray-100">
            Logged in as: <strong>{userId}</strong>
          </p>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginPage;