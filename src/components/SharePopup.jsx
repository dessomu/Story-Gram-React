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
        <button className="share-close-btn" onClick={onClose}>
          ✕
        </button>

        <h3 className="share-title">Share Story</h3>

        <div className="share-options">
          <button className="share-option" onClick={handleCopy}>
            <img src={link} alt="copylink" />
            <span>Copy Link</span>
          </button>

          <a
            className="share-option"
            href={`https://wa.me/?text=${encodeURIComponent(mediaURL)}`}
            target="_blank"
          >
            <img src={whatsApp} alt="whatsapp" />
            <span>WhatsApp</span>
          </a>

          <a
            className="share-option"
            href={`https://t.me/share/url?url=${encodeURIComponent(mediaURL)}`}
            target="_blank"
          >
            <img src={teleGram} alt="telegram" />
            <span>Telegram</span>
          </a>

          <button className="share-option" onClick={handleSystemShare}>
            <span>📤</span>
            <span>System Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
