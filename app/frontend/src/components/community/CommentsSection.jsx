import CommentInput from "./CommentInput";
export default function CommentsSection({ comments = [], onAddComment }) {
  return (
    <div className="comments-section">
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="comment-avatar">{comment.author?.charAt(0)}</div>
            <div className="comment-content">
              <div className="comment-header">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-time">{comment.timestamp}</span>
              </div>
              <p className="comment-text">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
      <CommentInput onSubmit={onAddComment} />
    </div>
  );
}
