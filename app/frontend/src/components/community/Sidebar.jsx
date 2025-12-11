import React from "react";
import TrendingPosts from "./TrendingPosts";
import { TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function Sidebar({
  mostLikedPosts = [],
  mostLikedLoading = false,
  onAnalyze,
}) {
  const navigate = useNavigate();
  return (
    <div>
      <div className="sidebar-section">
        <div className="sidebar-header">
          <TrendingUp size={20} />
          <h2>Most Liked Posts</h2>
        </div>
        {mostLikedLoading && (
          <div className="loader-row" style={{ margin: "1rem 0" }}>
            <div className="spinner" aria-hidden="true"></div>
            <div className="loader-text">Loading most liked posts…</div>
          </div>
        )}
        <TrendingPosts posts={mostLikedPosts} />
      </div>
      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Quick Actions</h3>
        <button className="sidebar-button" onClick={onAnalyze}>
          Analyze Your Region
        </button>
        <button
          className="sidebar-button secondary"
          onClick={() => navigate("/saved")}
        >
          View Saved Posts
        </button>
      </div>
    </div>
  );
}
