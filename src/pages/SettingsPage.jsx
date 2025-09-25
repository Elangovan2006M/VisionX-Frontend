import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaTrash, FaSignOutAlt } from "react-icons/fa";
import ConfirmPopup from "../components/ConfirmPopup";
import {
  getCurrentUserEmail,
  deleteUserAccount,
  sendPasswordResetEmailForCurrentUser,
  auth,
} from "../services/firebase";
import { signOut } from "firebase/auth";
import "../styles/SettingsPage.css";
import { FaUserCheck } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";

function SettingsPage() {
  const navigate = useNavigate();
  const [popup, setPopup] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [statusMsg, setStatusMsg] = useState(""); // For inline messages
  const [loading, setLoading] = useState(false);

  // Fetch current user email
  useEffect(() => {
    const fetchEmail = async () => {
      const email = await getCurrentUserEmail();
      setUserEmail(email);
    };
    fetchEmail();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setStatusMsg("Logged out successfully");
      setPopup(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      setStatusMsg("Logout failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteUserAccount();
      setStatusMsg("Account deleted successfully");
      setPopup(null);
      navigate("/signup");
    } catch (err) {
      console.error("Delete account error:", err);
      if (err.code === "auth/requires-recent-login") {
        setStatusMsg("Please log in again before deleting your account.");
      } else {
        setStatusMsg("Failed to delete account. Try again later.");
      }
      setPopup(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      await sendPasswordResetEmailForCurrentUser();
      setStatusMsg(`Password reset email sent to ${userEmail}`);
      setPopup(null);
    } catch (err) {
      console.error("Password reset failed:", err);
      setStatusMsg("Failed to send password reset email. Try again later.");
      setPopup(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <IoIosArrowBack />
        </button>
        <h2 className="settings-title">Settings</h2>
      </div>

      {userEmail && <p className="user-email"> <FaUserCheck />  {userEmail}</p>}
      {statusMsg && <p className="status-message">{statusMsg}</p>}

      <div className="settings-options">
        <button className="settings-btn" onClick={() => setPopup("reset")}>
          <FaLock className="icon" /> Change Password
        </button>

        <button className="settings-btn danger" onClick={() => setPopup("delete")}>
          <FaTrash className="icon" /> Delete Account
        </button>

        <button className="settings-btn" onClick={() => setPopup("logout")}>
          <FaSignOutAlt className="icon" /> Logout
        </button>
      </div>

      {/* Confirm Popup */}
      {popup && (
        <ConfirmPopup
          message={
            popup === "delete"
              ? "Are you sure you want to delete your account? This action cannot be undone."
              : popup === "logout"
              ? "Are you sure you want to log out?"
              : "Do you want to reset your password? A reset email will be sent."
          }
          onConfirm={
            popup === "delete"
              ? handleDeleteAccount
              : popup === "logout"
              ? handleLogout
              : handlePasswordReset
          }
          onCancel={() => setPopup(null)}
          loading={loading}
        />
      )}
    </div>
  );
}

export default SettingsPage;
