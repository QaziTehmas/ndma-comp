import React, { useState } from "react";
import {
  Image as ImageIcon,
  Send,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import "./AddPostForm.css";
import { API_BASE } from "../../config/api";

export default function AddPostForm({ onAddPost }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    category: "flood",
    link: "",
    latitude: "",
    longitude: "",
    status: "active",
  });
  const [imagePreview, setImagePreview] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      location: "",
      category: "flood",
      link: "",
      latitude: "",
      longitude: "",
      status: "active",
    });
    setImagePreview([]);
    setImageFiles([]);
  };

  const handleSuccess = () => {
    setStatus("success");
    setErrorMsg(null);
    resetForm();
    setTimeout(() => {
      setStatus("idle");
      setIsExpanded(false); // Auto-collapse after successful post
    }, 2500);
  };

  const handleError = (error, message) => {
    console.error("Error creating report:", error);
    setStatus("error");
    setErrorMsg(message || "Failed to create report");
  };

  const handleImage = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setImageFiles(files);
      setImagePreview(files.map((f) => URL.createObjectURL(f)));
    }
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("location_name", form.location);
    fd.append("latitude", form.latitude || "0");
    fd.append("longitude", form.longitude || "0");
    fd.append("disaster_type", form.category);
    fd.append("link", form.link);
    fd.append("status", form.status);

    if (imageFiles.length) {
      imageFiles.forEach((file) => fd.append("images", file));
    }

    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.location) {
      setErrorMsg("Please fill in the title, description and location.");
      return;
    }
    setErrorMsg(null);
    setStatus("posting");
    const fd = buildFormData();

    try {
      if (onAddPost) {
        const created = await onAddPost(fd);
        if (!created) {
          handleError(null, "Failed to create report. Please try again.");
          return;
        }
        handleSuccess();
        return;
      }
      handleSuccess();
    } catch (err) {
      handleError(
        err,
        err?.message || "Failed to create report. See console for details."
      );
    }
  };

  return (
    <div className="add-post-container">
      <button
        className="add-post-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <Plus size={20} />
        <span>{isExpanded ? "Hide Form" : "Add New Post"}</span>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <div
        className={`add-post-carousel ${isExpanded ? "expanded" : "collapsed"}`}
      >
        <form className="add-post-form" onSubmit={handleSubmit}>
          {errorMsg && <div className="form-error">{errorMsg}</div>}
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <input
            type="url"
            placeholder="Reference link (optional)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />

          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="disaster-select"
          >
            <option value="flood">Flood</option>
            <option value="earthquake">Earthquake</option>
            <option value="storm">Storm</option>
            <option value="other">Other Disaster</option>
          </select>

          {imagePreview.length > 0 && (
            <div className="image-preview-grid">
              {imagePreview.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  className="imagepreview"
                />
              ))}
            </div>
          )}

          <div className="add-post-form-buttons">
            <label className="upload-label">
              <ImageIcon size={20} />
              Upload Image
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImage}
                className="hidden-file-input"
              />
            </label>
            <button
              type="submit"
              className={`submit-post ${status === "success" ? "success" : ""}`}
              disabled={status === "posting"}
            >
              <Send size={20} />
              {status === "posting"
                ? "Posting..."
                : status === "success"
                ? "Posted"
                : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
