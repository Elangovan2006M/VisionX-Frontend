import "../styles/ConfirmPopup.css";

function ConfirmPopup({ message, onConfirm, onCancel }) {
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <p>{message}</p>
        <div className="popup-actions">
          <button className="popup-btn confirm" onClick={onConfirm}>
            Yes
          </button>
          <button className="popup-btn cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmPopup;
