import { useEffect, useContext, useRef, useState } from "react";
import StoryContext from "../contexts/StoryContext";
import API from "../api";
import socket from "../lib/socket";
import "./compStyles/StoryList.css";

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
    try {
      await API.delete(`/stories/${storyId}`);
      setStories((prev) => prev.filter((story) => story._id !== storyId));
    } catch (err) {
      console.error("Failed to delete story:", err);
    }
  };

  useEffect(() => {
    socket.on("storyDeleted", (storyId) => {
      setStories((prev) => prev.filter((story) => story._id !== storyId)); // listening for delete story & deleting in real time
    });

    socket.on("storyAdded", (story) => {
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
    <div className="storylist-container">
      <div className="storylist-title">Stories Feed</div>

      <div className="storylist-grid">
        {stories.map((story) => (
          <div key={story._id} className="story-card">
            {story.mediaType === "video" ? (
              <video src={story.mediaURL} controls className="story-video" />
            ) : (
              <img src={story.mediaURL} alt="story" className="story-image" />
            )}

            {story.userId?._id === currentUserId && (
              <button
                className="story-delete-btn"
                onClick={() => handleDelete(story._id)}
              >
                🗑️
              </button>
            )}

            <p className="story-author">
              <strong>{story.userId?.name}</strong>
            </p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="storylist-loader">
          <p>Loading more stories...</p>
        </div>
      )}
    </div>
  );
};

export default StoryList;
