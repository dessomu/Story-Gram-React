import { useEffect, useState } from "react";
import API from "../api";

const StoryList = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await API.get("/stories");
        setStories(res.data);
      } catch (err) {
        console.error("Error fetching stories:", err);
      }
    };
    fetchStories();
  }, []);

  return (
    <main
      style={{
        display: "flex",
        gap: 20,
        flexWrap: "wrap",
        padding: "20px",
        background: "red",
      }}
    >
      {stories.map((story) => (
        <div
          key={story._id}
          style={{
            width: 200,
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: 10,
            textAlign: "center",
          }}
        >
          <img
            src={story.imageURL}
            alt="story"
            style={{ width: "100%", borderRadius: 8 }}
          />
          <p style={{ fontSize: 14, marginTop: 5 }}>
            {story.userId?.name || "Unknown User"}
          </p>
        </div>
      ))}
    </main>
  );
};

export default StoryList;
