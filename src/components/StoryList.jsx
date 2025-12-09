import { useEffect, useContext, useRef, useState } from "react";
import StoryContext from "../contexts/StoryContext";
import API from "../api";
import socket from "../lib/socket";
import "./compStyles/StoryList.css";
import SharePopup from "./SharePopup";
import mute from "../assets/mute.png";
import unmute from "../assets/unmute.png";
import like from "../assets/like.png";
import chat from "../assets/bubble-chat.png";
import share from "../assets/share.png";
import formatDateTime from "../lib/formatDateTime";

const StoryList = ({ currentUserId }) => {
  // const [stories, setStories] = useState([]);
  const { stories, setStories } = useContext(StoryContext);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const [comment, setComment] = useState("");
  const [expandedStoryId, setExpandedStoryId] = useState(null);
  const [shareStory, setShareStory] = useState(null);

  const [expandedLikeStoryId, setExpandedLikeStoryId] = useState(null); // similar to expandedStoryId comments section

  const [playingStoryId, setPlayingStoryId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const videoRefs = useRef({}); // Store references to all video elements
  const observerRef = useRef(null);

  const [isHover, setIsHover] = useState(false);

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

  // load likes effect
  useEffect(() => {
    if (!expandedLikeStoryId) return;

    const loadLikes = async () => {
      try {
        const res = await API.get(`/likes/${expandedLikeStoryId}/likes`);

        setStories((prev) =>
          prev.map((s) =>
            s._id === expandedLikeStoryId
              ? { ...s, likeUsers: res.data.likes }
              : s
          )
        );
      } catch (err) {
        console.error("Failed to load likes:", err);
      }
    };

    loadLikes();
  }, [expandedLikeStoryId, setStories]);

  // load comment effect
  useEffect(() => {
    if (!expandedStoryId) return; // only run when user opens comments panel

    const loadComments = async () => {
      try {
        const res = await API.get(`/comments/${expandedStoryId}/comments`);
        console.log(res.data.comments);

        setStories((prev) =>
          prev.map((s) =>
            s._id === expandedStoryId._id
              ? { ...s, comments: res.data.comments }
              : s
          )
        );
      } catch (error) {
        console.error("Failed to load comments:", error);
      }
    };

    loadComments();
  }, [expandedStoryId, setStories]);

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

  // 1. Setup Intersection Observer
  useEffect(() => {
    const options = {
      root: null, // viewport
      rootMargin: "0px",
      threshold: 0.6, // Video must be 60% visible to start playing
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const storyId = entry.target.getAttribute("data-id");
          setPlayingStoryId(storyId);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);

    // Observe all video elements currently in the DOM
    const videoElements = Object.values(videoRefs.current);
    videoElements.forEach((el) => {
      if (el) observerRef.current.observe(el);
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [stories]);

  // 2. Handle Play/Pause Logic based on playingStoryId
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((key) => {
      const videoEl = videoRefs.current[key];
      if (!videoEl) return;

      if (key === playingStoryId) {
        // This is the video in view
        const playPromise = videoEl.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            // Auto-play was prevented.
            // This usually happens if user hasn't interacted with document yet.
            console.log("Autoplay blocked:", error);
            // Optional: Force mute if audio autoplay is blocked
            // setIsMuted(true);
            // videoEl.muted = true;
            // videoEl.play();
          });
        }
      } else {
        // Not in view, pause and reset
        videoEl.pause();
        videoEl.currentTime = 0; // Optional: Reset video to start
      }
    });
  }, [playingStoryId]);

  // Toggle Global Mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

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
      await API.patch(`/likes/${storyId}/like`);
      // UI will update automatically via socket listener below
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };

  const handleComment = async (storyId) => {
    if (!comment.trim()) return;

    try {
      await API.post(`/comments/${storyId}/comment`, { text: comment });
      // real-time update received via socket
      setComment("");
    } catch (err) {
      console.error("Failed to comment:", err);
    }
  };

  const handleDeleteComment = async (storyId, commentId) => {
    try {
      await API.delete(`/comments/${storyId}/comment/${commentId}`);
      setExpandedStoryId(null);
      // socket will update UI for everyone
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  useEffect(() => {
    const handleCommentAdded = ({ storyId, comment }) => {
      console.log(comment);

      setStories((prev) =>
        prev.map((s) =>
          s._id === storyId
            ? {
                ...s,
                comments: [...(s.comments || []), comment],
                commentCount: (s.commentCount || 0) + 1,
              }
            : s
        )
      );
    };

    const handleLikeUpdated = ({ storyId, likeCount }) => {
      console.log(likeCount);

      setStories((prev) =>
        prev.map((s) => (s._id === storyId ? { ...s, likeCount } : s))
      );
    };
    const handleCommentDeleted = ({ storyId, commentId }) =>
      setStories((prev) =>
        prev.map((s) =>
          s._id === storyId
            ? {
                ...s,
                comments: s.comments?.filter((c) => c._id !== commentId) || [],
                commentCount: s.commentCount - 1,
              }
            : s
        )
      );

    const handleStoryDeleted = (storyId) =>
      setStories((prev) => prev.filter((s) => s._id !== storyId));

    const handleStoryAdded = (story) => {
      console.log(story);

      setStories((prev) =>
        prev.some((s) => s._id === story._id) ? prev : [story, ...prev]
      );
    };

    socket.on("commentAdded", handleCommentAdded);
    socket.on("likeUpdated", handleLikeUpdated);
    socket.on("commentDeleted", handleCommentDeleted);
    socket.on("storyDeleted", handleStoryDeleted);
    socket.on("storyAdded", handleStoryAdded);

    return () => {
      socket.off("commentAdded", handleCommentAdded);
      socket.off("likeUpdated", handleLikeUpdated);
      socket.off("commentDeleted", handleCommentDeleted);
      socket.off("storyDeleted", handleStoryDeleted);
      socket.off("storyAdded", handleStoryAdded);
    };
  }, [setStories]);

  const toggleComments = (storyId) => {
    setExpandedStoryId((prev) => (prev === storyId ? null : storyId));
    setExpandedLikeStoryId(null);
  };
  const toggleLikes = (storyId) => {
    setExpandedLikeStoryId((prev) => (prev === storyId ? null : storyId));
    setExpandedStoryId(null);
  };

  const handleTouchStart = () => {
    setIsHover(true);
  };

  const handleTouchEnd = () => {
    setIsHover(false);
  };

  return (
    <div className="storylist-container">
      {/* <div className="storylist-title">Stories Feed</div> */}

      <div className="storylist-grid">
        {stories.map((story) => (
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            key={story._id}
            className={isHover ? "hovered story-card " : "story-card"}
          >
            {/* Top bar */}
            <div className="story-header">
              <div className="story-header-left">
                <div className="story-avatar">
                  {story.userId?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="story-username">
                  {story.userId?.name}{" "}
                  <p className="story-posted-at">
                    {formatDateTime(story.createdAt)}
                  </p>
                </span>
              </div>

              {story.userId?._id === currentUserId && (
                <button
                  className={
                    isHover ? "hovered story-delete-btn " : "story-delete-btn"
                  }
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  onClick={() => handleDelete(story._id)}
                >
                  Delete
                </button>
              )}
            </div>

            {/* Media */}
            {story.mediaType === "video" ? (
              <>
                <video
                  ref={(el) => (videoRefs.current[story._id] = el)}
                  data-id={story._id}
                  src={story.mediaURL}
                  className="story-media"
                  // Vital attributes for mobile/autoplay
                  playsInline
                  webkit-playsinline="true"
                  loop
                  muted={isMuted}
                  preload="metadata"
                  onClick={toggleMute} // Tap video to mute/unmute
                />
                <div className="mute-indicator" onClick={toggleMute}>
                  {isMuted ? (
                    <img src={mute} alt="mute" />
                  ) : (
                    <img src={unmute} alt="mute" />
                  )}
                </div>
              </>
            ) : (
              <img src={story.mediaURL} alt="story" className="story-media" />
            )}

            {/* Action Bar */}
            <div className="story-actions">
              <span className="action-icon">
                <img
                  onClick={() => handleLike(story._id)}
                  className="story-action-icon like"
                  src={like}
                  alt="like"
                />{" "}
                <p
                  className="story-action-text"
                  onClick={() => toggleLikes(story._id)}
                >
                  {story.likeCount}
                  {""} {story.likeCount === 1 ? "Like" : "Likes"}
                </p>
              </span>

              <span
                onClick={() => toggleComments(story._id)}
                className="action-icon"
              >
                <img
                  className="story-action-icon comment"
                  src={chat}
                  alt="comment"
                />{" "}
                <p className="story-action-text">
                  {story.commentCount}{" "}
                  {story.commentCount === 1 ? "Comment" : "Comments"}
                </p>
              </span>
              <span
                onClick={() => setShareStory(story)}
                className="action-icon"
              >
                <img
                  id="share-icon"
                  className="story-action-icon"
                  src={share}
                  alt="comment"
                />
                <p className="story-action-text">Share</p>
              </span>
            </div>
            {expandedStoryId === story._id && (
              <div className="comments-section">
                <div className="comments-header">
                  <p>Comments</p>
                  <button
                    className="comments-close-btn"
                    onClick={() => setExpandedStoryId(null)}
                  >
                    Close
                  </button>
                </div>

                <div className="comments-list">
                  {story.commentCount === 0 ? (
                    <p className="no-comments">No comments yet.</p>
                  ) : (
                    story.comments?.map((c) => (
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
                            onClick={() =>
                              handleDeleteComment(story._id, c._id)
                            }
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="comments-input">
                  <input
                    id="comment-input"
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button
                    id="comment-post-btn"
                    onClick={() => handleComment(story._id)}
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
            {expandedLikeStoryId === story._id && (
              <div className="likes-panel">
                <p>Liked by</p>

                {story.likeUsers?.length === 0 ? (
                  <p className="no-likes-text">No likes yet.</p>
                ) : (
                  story.likeUsers?.map((l) => (
                    <div key={l._id} className="like-row">
                      <div className="like-avatar">
                        {l.userId.profilePic ? (
                          <img
                            src={l.userId.profilePic}
                            className="avatar-img"
                          />
                        ) : (
                          l.userId.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span>{l.userId.name}</span>
                    </div>
                  ))
                )}

                <button
                  className="close-btn"
                  onClick={() => setExpandedLikeStoryId(null)}
                >
                  Close
                </button>
              </div>
            )}

            {/* Caption / Name Tag */}
            <div className="story-caption">
              <strong>
                {story.userId?._id === currentUserId
                  ? "You"
                  : `${story.userId?.name}`}
              </strong>{" "}
              posted {story.mediaType === "video" ? "a video" : "an image"}
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
