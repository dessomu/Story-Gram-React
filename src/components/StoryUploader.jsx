import { useState, useContext } from "react";
import API from "../api";
import StoryContext from "../contexts/StoryContext";

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
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 10,
      }}
    >
      <h3>Upload a Story</h3>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <div style={{ marginTop: 20 }}>
          <img
            src={preview}
            alt="preview"
            style={{ width: "100%", borderRadius: 8 }}
          />
        </div>
      )}

      <button
        style={{
          marginTop: 20,
          padding: "10px 20px",
          borderRadius: 6,
          background: "#007bff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload Story"}
      </button>
    </div>
  );
};

export default StoryUploader;
