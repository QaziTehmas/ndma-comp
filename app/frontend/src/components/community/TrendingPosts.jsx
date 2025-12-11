import React from "react";
import { Heart, MessageCircle } from "lucide-react";
export default function TrendingPosts({ posts = [] }) {
  return (
    <div className="trending-posts">
      {posts.map((post, index) => (
        <div key={post.id} className="trending-post">
          <span className="trending-rank">#{index + 1}</span>
          <div className="trending-content">
            <h4 className="trending-title">{post.title}</h4>
            <div className="trending-meta">
              <span className="trending-likes">
                <Heart size={14} />
                {post.likes}
              </span>
              <span className="trending-comments">
                <MessageCircle size={14} />
                {post.comments?.length || 0}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
