export function formatNewPost(serverPost, user) {
  return {
    id: String(serverPost.id),
    title: serverPost.title,
    description: serverPost.description,
    location: serverPost.location_name,
    category: serverPost.disaster_type,
    author:
      (user && (user.name || user.username)) || serverPost.author_name || "You",
    authorId: String(
      user?.id ??
        serverPost.author_id ??
        serverPost.authorId ??
        serverPost.user_id ??
        serverPost.userId ??
        ""
    ),
    author_profile: user ?? null,
    timestamp: new Date(serverPost.created_at).toLocaleString(),
    likes: Number(serverPost.likes_count) || 0,
    comments: [],
    image: serverPost.images?.length ? serverPost.images[0] : null,
    link: serverPost.link || "",
    latitude: String(serverPost.latitude ?? serverPost.lat ?? "0"),
    longitude: String(serverPost.longitude ?? serverPost.lon ?? "0"),
  };
}
