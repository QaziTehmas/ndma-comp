import React, { useState } from "react";
export default function CommentInput({ onSubmit }) {
  const [text, setText] = useState("");
  const submit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  };
  return (
    <div className="add-comment">
      <input
        type="text"
        placeholder="Add a comment..."
        className="comment-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && submit()}
      />
      <button className="comment-submit" onClick={submit}>
        Post
      </button>
    </div>
  );
}
