import { useEffect, useContext, useRef, useState } from "react";
import StoryContext from "../contexts/StoryContext";
import API from "../api";
import socket from "../lib/socket";

const StoryList = ({ currentUserId }) => {
  // const [stories, setStories] = useState([]);
  const { stories, setStories } = useContext(StoryContext);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  // Call loadStories when page changes
  useEffect(() => {
    const loadStories = async () => {
      try {
        const res = await API.get(`/stories?page=${page}`);

        setStories((prev) => {
          const combined = [...prev, ...res.data.stories];
          const unique = Array.from(
            new Map(combined.map((item) => [item._id, item])).values()
          );
          return unique;
        });
        setHasMore(res.data.hasMore);
      } catch (err) {
        console.error("Error fetching stories:", err);
      }
    };
    loadStories();
  }, [page, setStories]);

  // Intersection Observer to detect bottom of list
  useEffect(() => {
    if (!hasMore) return; // stop observing when no more content

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
        observer.disconnect();
      }
    });

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [hasMore]);

  // delete story
  const handleDelete = async (storyId) => {
    if (!window.confirm("Delete this story?")) return;

    try {
      await API.delete(`/stories/${storyId}`);
      setStories((prev) => prev.filter((story) => story._id !== storyId));
    } catch (err) {
      console.error("Failed to delete story:", err);
    }
  };

  useEffect(() => {
    socket.on("storyDeleted", (storyId) => {
      console.log("Story removed in real-time:", storyId);
      setStories((prev) => prev.filter((story) => story._id !== storyId)); // listening for delete story & deleting in real time
    });

    socket.on("storyAdded", (story) => {
      console.log("Story added in real-time:", story);
      setStories((prev) => {
        if (prev.some((s) => s._id === story._id)) return prev; // skip duplicates
        return [story, ...prev];
      }); // listening for new story & updating in real time
    });

    return () => {
      socket.off("storyDeleted");
      socket.off("storyAdded");
    };
  }, [setStories]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Stories Feed</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {stories.map((story) => (
          <div
            key={story._id}
            style={{
              position: "relative",
              display: "inline-block",
              marginBottom: "20px",
            }}
            className="story-card"
          >
            <img
              src={story.imageURL}
              width={120}
              style={{ borderRadius: 10 }}
            />

            {story.userId?._id === currentUserId && (
              <button
                onClick={() => handleDelete(story._id)}
                style={deleteButtonStyle}
                className="delete-btn"
              >
                🗑️
              </button>
            )}

            <p style={{ marginTop: 6 }}>
              <strong>{story.userId?.name}</strong>
            </p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={loaderRef} style={{ textAlign: "center", padding: 20 }}>
          <p>Loading more stories...</p>
        </div>
      )}
    </div>
  );
};

const deleteButtonStyle = {
  position: "absolute",
  top: 6,
  right: 6,
  background: "rgba(0,0,0,0.7)",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: 26,
  height: 26,
  cursor: "pointer",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.3s ease",
};

export default StoryList;
