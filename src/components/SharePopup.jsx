import "./compStyles/SharePopup.css";
import whatsApp from "../assets/whatsapp.png";
import teleGram from "../assets/telegram.png";
import link from "../assets/link.png";

export default function SharePopup({ mediaURL, onClose }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(mediaURL);
    alert("Link copied!");
  };

  const handleSystemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check this Story",
          text: "Check out this story!",
          url: mediaURL,
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      alert("Share not supported on this device");
    }
  };

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <h3 className="share-title">Share Story</h3>

        <div className="share-options">
          <button className="share-item" onClick={handleCopy}>
            <img
              style={{ width: "20px", height: "20px" }}
              src={link}
              alt="CopyLink"
            />{" "}
            Copy Link
          </button>

          <a
            className="share-item"
            href={`https://wa.me/?text=${encodeURIComponent(mediaURL)}`}
            target="_blank"
          >
            <img
              style={{ width: "20px", height: "20px" }}
              src={whatsApp}
              alt="WhatsApp"
            />{" "}
            WhatsApp
          </a>

          <a
            className="share-item"
            href={`https://t.me/share/url?url=${encodeURIComponent(mediaURL)}`}
            target="_blank"
          >
            <img
              style={{ width: "20px", height: "20px" }}
              src={teleGram}
              alt="Telegram"
            />{" "}
            Telegram
          </a>

          <button className="share-item" onClick={handleSystemShare}>
            📤 System Share
          </button>
        </div>
      </div>
    </div>
  );
}
