import PostCard from "./PostCard";
import LoadingStates from "./LoadingStates";
import { isOwnerOf } from "../../utils/postOwnership";

export default function PostsList({
  posts,
  loading,
  fetchError,
  likedPosts,
  savedPosts,
  expandedComments,
  user,
  onRefresh,
  onDelete,
  onLike,
  onSave,
  onToggleComments,
  onAddComment,
}) {
  return (
    <>
      <LoadingStates
        loading={loading}
        fetchError={fetchError}
        postsCount={posts.length}
        onRefresh={onRefresh}
      />

      {!loading &&
        !fetchError &&
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isLiked={likedPosts.has(post.id)}
            isSaved={savedPosts.has(post.id)}
            commentsExpanded={expandedComments.has(post.id)}
            isOwner={isOwnerOf(post, user)}
            onDelete={() => onDelete(post.id)}
            onLike={() => onLike(post.id)}
            onSave={() => onSave(post.id)}
            onToggleComments={() => onToggleComments(post.id)}
            onAddComment={(text) => onAddComment(post.id, text)}
          />
        ))}
    </>
  );
}
