import React, { useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Clock,
  MapPin,
  Trash2,
  Pin,
} from "lucide-react";
import CommentsSection from "./CommentsSection";
const getCategoryBadge = (category) => {
  const badges = {
    flood: { text: "Flood Alert", class: "badge-flood" },
    earthquake: { text: "Earthquake", class: "badge-earthquake" },
    general: { text: "Community", class: "badge-general" },
  };
  return badges[category] || badges.general;
};
export default function PostCard({
  post,
  isLiked,
  isSaved,
  commentsExpanded,
  onLike,
  onSave,
  onToggleComments,
  onAddComment,
  isOwner,
  onDelete,
  pinned,
}) {
  const badge = getCategoryBadge(post.category);
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    const el = descRef.current;
    if (!el) {
      setTruncated(false);
      return;
    }

    const check = () => {
      try {
        const clone = el.cloneNode(true);
        // ensure clone is measurable and not affected by clamping
        clone.style.position = "absolute";
        clone.style.visibility = "hidden";
        clone.style.height = "auto";
        clone.style.maxHeight = "none";
        clone.style.display = "block";
        clone.style.WebkitLineClamp = "none";
        clone.style.WebkitBoxOrient = "vertical";
        clone.style.overflow = "visible";
        clone.style.width = `${el.clientWidth}px`;
        document.body.appendChild(clone);
        const fullHeight = clone.scrollHeight;
        document.body.removeChild(clone);

        const cs = window.getComputedStyle(el);
        const lineHeight = parseFloat(cs.lineHeight) || 18;
        const maxH = lineHeight * 4;
        setTruncated(fullHeight > maxH + 1);
      } catch {
        setTruncated(false);
      }
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [post.description]);
  return (
    <article className="post-card">
      <div className="post-header">
        <div className="post-author-info">
          <div className="author-avatar">{post.author?.charAt(0)}</div>
          <div>
            <h3 className="author-name">{post.author}</h3>
            <div className="post-meta">
              <Clock size={14} />
              <span>{post.timestamp}</span>
              <MapPin size={14} />
              <span>{post.location}</span>
            </div>
          </div>
        </div>
        <div className="post-badges">
          <span className={`category-badge ${badge.class}`}>{badge.text}</span>
          {pinned && (
            <span className="pinned-badge">
              <Pin size={14} /> Pinned
            </span>
          )}
        </div>
      </div>
      {post.image && (
        <div className="post-image-container">
          <img src={post.image} alt={post.title} className="post-image" />
        </div>
      )}
      <div className="post-content">
        <h2 className="post-title">{post.title}</h2>
        <p
          ref={descRef}
          className={`post-description ${
            !expanded && truncated ? "clamped" : ""
          }`}
          style={
            !expanded && truncated
              ? {
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
              : {}
          }
        >
          {post.description}
        </p>
        {truncated && (
          <button
            type="button"
            className="see-more-btn"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "See more"}
          </button>
        )}
      </div>
      <div className="post-actions">
        <button
          className={`action-button ${isLiked ? "active-like" : ""}`}
          onClick={onLike}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          <span>{post.likes}</span>
        </button>
        <button
          className={`action-button ${commentsExpanded ? "active" : ""}`}
          onClick={onToggleComments}
        >
          <MessageCircle size={20} />
          <span>{post.comments?.length || 0}</span>
        </button>
        <button
          className={`action-button ${isSaved ? "active-save" : ""}`}
          onClick={onSave}
        >
          <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
        </button>
        <button
          className="action-button"
          onClick={() => {
            const link = post?.link;
            if (!link) return;
            try {
              // validate URL
              const url = new URL(link);
              window.open(url.toString(), "_blank", "noopener,noreferrer");
            } catch {
              // invalid URL - do nothing
            }
          }}
        >
          <Share2 size={20} />
        </button>
        {isOwner && (
          <button
            className={`action-button delete-button`}
            onClick={onDelete}
            title="Delete post"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      {commentsExpanded && (
        <CommentsSection comments={post.comments} onAddComment={onAddComment} />
      )}
    </article>
  );
}
