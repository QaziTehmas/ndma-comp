import PostCard from "./PostCard";
import { isOwnerOf } from "../../utils/postOwnership";

export default function PinnedSection({
  posts,
  likedPosts,
  savedPosts,
  expandedComments,
  user,
  onDelete,
  onLike,
  onSave,
  onToggleComments,
  onAddComment,
}) {
  return (
    <section className="pinned-section">
      <h2 className="pinned-title">Pinned</h2>
      <div className="pinned-list">
        {posts.map((post) => (
          <PostCard
            key={`pinned-${post.id}`}
            post={post}
            pinned={true}
            isLiked={likedPosts.has(String(post.id))}
            isSaved={savedPosts.has(String(post.id))}
            commentsExpanded={expandedComments.has(String(post.id))}
            isOwner={isOwnerOf(post, user)}
            onDelete={() => onDelete(post.id)}
            onLike={() => onLike(post.id)}
            onSave={() => onSave(post.id)}
            onToggleComments={() => onToggleComments(post.id)}
            onAddComment={(text) => onAddComment(post.id, text)}
          />
        ))}
      </div>
    </section>
  );
}
