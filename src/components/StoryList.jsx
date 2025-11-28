import { useEffect, useContext, useRef, useState } from "react";
import StoryContext from "../contexts/StoryContext";
import API from "../api";
import socket from "../lib/socket";
import "./compStyles/StoryList.css";
import SharePopup from "./SharePopup";

const StoryList = ({ currentUserId }) => {
  // const [stories, setStories] = useState([]);
  const { stories, setStories } = useContext(StoryContext);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const [comment, setComment] = useState("");
  const [expandedStoryId, setExpandedStoryId] = useState(null);

  const [shareStory, setShareStory] = useState(null);

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

  const handleLike = async (storyId) => {
    try {
      const res = await API.patch(`/stories/${storyId}/like`);

      setStories((prev) =>
        prev.map((s) =>
          s._id === storyId ? { ...s, likes: res.data.likes } : s
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (storyId) => {
    const res = await API.post(`/stories/${storyId}/comment`, {
      text: comment,
    });

    setStories((prev) =>
      prev.map((s) =>
        s._id === storyId ? { ...s, comments: res.data.comments } : s
      )
    );
    console.log(stories);

    setComment("");
  };

  const handleDeleteComment = async (storyId, commentId) => {
    try {
      await API.delete(`/stories/${storyId}/comment/${commentId}`);
      // socket will update UI
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  useEffect(() => {
    const handleCommentAdded = ({ storyId, comments }) => {
      setStories((prev) =>
        prev.map((s) => (s._id === storyId ? { ...s, comments } : s))
      );
    };

    const handleLikeUpdated = ({ storyId, likes }) => {
      setStories((prev) =>
        prev.map((s) => (s._id === storyId ? { ...s, likes } : s))
      );
    };

    const handleStoryDeleted = (storyId) => {
      setStories((prev) => prev.filter((story) => story._id !== storyId));
    };

    const handleStoryAdded = (story) => {
      setStories((prev) => {
        if (prev.some((s) => s._id === story._id)) return prev; // avoid duplicates
        return [story, ...prev];
      });
    };

    const handleCommentDelete = ({ storyId, comments }) => {
      setStories((prev) =>
        prev.map((s) => (s._id === storyId ? { ...s, comments } : s))
      );
    };

    // Register listeners
    socket.on("commentAdded", handleCommentAdded);
    socket.on("likeUpdated", handleLikeUpdated);
    socket.on("storyDeleted", handleStoryDeleted);
    socket.on("storyAdded", handleStoryAdded);
    socket.on("commentDeleted", handleCommentDelete);

    // Cleanup listeners on unmount
    return () => {
      socket.off("commentAdded", handleCommentAdded);
      socket.off("likeUpdated", handleLikeUpdated);
      socket.off("storyDeleted", handleStoryDeleted);
      socket.off("storyAdded", handleStoryAdded);
      socket.off("commentDeleted", handleCommentDelete);
    };
  }, [setStories]);

  const toggleComments = (storyId) => {
    setExpandedStoryId((prev) => (prev === storyId ? null : storyId));
    console.log(stories);
  };

  return (
    <div className="storylist-container">
      {/* <div className="storylist-title">Stories Feed</div> */}

      <div className="storylist-grid">
        {stories.map((story) => (
          <div key={story._id} className="story-card">
            {/* Top bar */}
            <div className="story-header">
              <div className="story-header-left">
                <div className="story-avatar">
                  {story.userId?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="story-username">{story.userId?.name}</span>
              </div>

              {story.userId?._id === currentUserId && (
                <button
                  className="story-delete-btn"
                  onClick={() => handleDelete(story._id)}
                >
                  Delete
                </button>
              )}
            </div>

            {/* Media */}
            {story.mediaType === "video" ? (
              <video src={story.mediaURL} controls className="story-media" />
            ) : (
              <img src={story.mediaURL} alt="story" className="story-media" />
            )}

            {/* Action Bar */}
            <div className="story-actions">
              <span
                onClick={() => handleLike(story._id)}
                className="action-icon"
              >
                ❤️ {story.likes?.length}
              </span>
              <span
                onClick={() => toggleComments(story._id)}
                className="action-icon"
              >
                💬 {story.comments?.length}
              </span>
              <span
                onClick={() => setShareStory(story)}
                className="action-icon"
              >
                ↗
              </span>
            </div>
            {expandedStoryId === story._id && (
              <div className="comments-section">
                <div className="comments-header">
                  <h4>Comments</h4>
                  <button
                    className="comments-close-btn"
                    onClick={() => setExpandedStoryId(null)}
                  >
                    Close
                  </button>
                </div>

                <div className="comments-list">
                  {story.comments?.length === 0 && (
                    <p className="no-comments">No comments yet.</p>
                  )}

                  {story.comments?.map((c) => (
                    <div key={c._id} className="comment-row">
                      <div className="avatar-small">
                        {c.userId?.profilePic ? (
                          <img
                            src={c.userId.profilePic}
                            alt=""
                            className="avatar-img"
                          />
                        ) : (
                          c.userId?.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <strong>{c.userId?.name}</strong>
                      <span>{c.text}</span>
                      {c.userId?._id === currentUserId && (
                        <button
                          className="delete-comment-btn"
                          onClick={() => handleDeleteComment(story._id, c._id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="comments-input">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button onClick={() => handleComment(story._id)}>Post</button>
                </div>
              </div>
            )}

            {/* Caption / Name Tag */}
            <div className="story-caption">
              <strong>{story.userId?.name}</strong> posted{" "}
              {story.mediaType === "video" ? "a video" : "an image"}
              -story
            </div>
          </div>
        ))}
        {shareStory && (
          <SharePopup
            mediaURL={shareStory.mediaURL}
            onClose={() => setShareStory(null)}
          />
        )}
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
