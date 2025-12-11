export function isOwnerOf(post, user) {
  if (!user) return false;

  const uid = String(
    user.id ?? user.user_id ?? user.userId ?? user._id ?? ""
  ).trim();
  const aid = String(
    post.authorId ?? post.author_id ?? post.user_id ?? post.userId ?? ""
  ).trim();

  if (uid && aid && uid === aid) return true;

  // Fallback: match by display name
  const uname = String(
    user.name ?? user.username ?? user.user_name ?? ""
  ).trim();
  const pauthor = String(
    post.author ?? post.author_name ?? post.user_name ?? ""
  ).trim();

  if (uname && pauthor && uname === pauthor) return true;

  return false;
}
