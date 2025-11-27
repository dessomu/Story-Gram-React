import { useState, useContext } from "react";
import API from "../api";
import StoryContext from "../contexts/StoryContext";
import "./compStyles/StoryUploader.css";
import vidUpload from "../assets/vid-upload.png";
import picUpload from "../assets/pic-upload.png";

const StoryUploader = ({ userId }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const { setStories } = useContext(StoryContext);

  // When user selects image
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  // Upload to backend
  const handleUpload = async () => {
    if (!file) return alert("Please select an image/video first!");

    try {
      setLoading(true);

      // Step 1: upload image to backend (Cloudinary)
      const formData = new FormData();
      formData.append("image", file);

      const uploadRes = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageURL = uploadRes.data.url;
      console.log(imageURL, userId);

      // Step 2: save the story in MongoDB
      const storyRes = await API.post("/stories", { userId, imageURL });

      console.log("✅ Story saved:", storyRes.data.stories);
      setStories(storyRes.data.stories);
      setFile(null);
      setPreview("");
    } catch (error) {
      console.error(error);
      alert("Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="su-card">
      <div className="su-top">
        <div className="su-input-fake">
          <p>Share your story...</p>
        </div>
      </div>

      <div className="su-divider"></div>

      <div className="su-actions">
        <label className="su-action-btn">
          <img src={picUpload} alt="photo" />
          <span>Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
        </label>

        <label className="su-action-btn">
          <img src={vidUpload} alt="video" />
          <span>Video</span>
          <input type="file" accept="video/*" hidden />
        </label>
      </div>

      {preview && (
        <div className="su-preview">
          <img src={preview} alt="preview" />
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
    </div>
  );
};

export default StoryUploader;
