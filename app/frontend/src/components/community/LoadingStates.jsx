export default function LoadingStates({
  loading,
  fetchError,
  postsCount,
  onRefresh,
}) {
  if (loading) {
    return (
      <div className="loader-row">
        <div className="spinner" aria-hidden="true"></div>
        <div className="loader-text">Loading posts…</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="posts-error">
        <p>Failed to load posts: {fetchError}</p>
        <button className="refresh-button" onClick={onRefresh}>
          Refresh
        </button>
      </div>
    );
  }

  if (!loading && !fetchError && postsCount === 0) {
    return <div className="no-posts">No posts yet.</div>;
  }

  return null;
}
