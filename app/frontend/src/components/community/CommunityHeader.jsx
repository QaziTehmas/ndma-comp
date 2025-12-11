export default function CommunityHeader({ onBack }) {
  return (
    <header className="community-header">
      <div className="header-content">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>
        <h1 className="community-title">Community Hub</h1>
        <p className="community-subtitle">
          Share experiences, alerts, and support each other
        </p>
      </div>
    </header>
  );
}
