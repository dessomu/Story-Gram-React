import { useState } from "react";
import API from "../api";
import "./compStyles/StoryUploader.css";
import vidUpload from "../assets/vid-upload.png";
import picUpload from "../assets/pic-upload.png";

const StoryUploader = ({ userId }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileType, setFileType] = useState("");
  const [loading, setLoading] = useState(false);

  const [progress, setProgress] = useState(0);

  const [showChooser, setShowChooser] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setFileType(selected.type.startsWith("video") ? "video" : "image");
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select an image/video first!");

    try {
      setLoading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("media", file);

      const uploadRes = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        },
      });

      const mediaURL = uploadRes.data.url;
      const publicId = uploadRes.data.publicId;

      await API.post("/stories", {
        userId,
        mediaURL,
        mediaType: fileType,
        mediaPublicId: publicId,
      });

      setProgress(100);
      setFile(null);
      setPreview("");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="su-card">
      <div className="su-top">
        <div className="su-input-fake" onClick={() => setShowChooser(true)}>
          <p>Share your story...</p>
        </div>
      </div>

      <div className="su-divider"></div>

      <div className="su-actions">
        <label className="su-action-btn">
          <img id="upload-photo-icon" src={picUpload} alt="photo" />
          <span>Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
        </label>

        <label className="su-action-btn">
          <img id="upload-video-icon" src={vidUpload} alt="video" />
          <span>Video</span>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            hidden
          />
        </label>
      </div>

      {preview && (
        <div className="su-preview">
          {fileType === "video" ? (
            <video src={preview} controls />
          ) : (
            <img src={preview} alt="preview" />
          )}
          {progress > 0 && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {preview && (
        <button
          className="su-upload-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Story"}
        </button>
      )}
      {showChooser && (
        <div className="story-type-overlay">
          <div className="story-type-modal">
            <h3>Create a story</h3>

            <div className="story-type-options">
              <label className="story-type-btn">
                📷 Photo Story
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    handleFileChange(e);
                    setShowChooser(false);
                  }}
                />
              </label>

              <label className="story-type-btn">
                🎥 Video Story
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => {
                    handleFileChange(e);
                    setShowChooser(false);
                  }}
                />
              </label>
            </div>

            <button
              className="story-type-cancel"
              onClick={() => setShowChooser(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryUploader;
