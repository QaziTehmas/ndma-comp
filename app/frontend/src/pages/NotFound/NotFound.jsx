import { useNavigate } from "react-router-dom";
import "./NotFound.css";
import notFoundImage from "../../assets/flood.png";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="main-content">
      <div className="notfound-page">
        <div className="page-container">
          <img src={notFoundImage} alt="404 Not Found" />
          <div className="notfound-content">
            <h1 className="notfound-title">404</h1>
            <h2 className="notfound-subtitle">Page Not Found</h2>
            <p className="notfound-description">
              Oops! The page you're looking for doesn't exist. It might have
              been moved or deleted.
            </p>
            <div className="notfound-buttons">
              <button className="btn btn-primary" onClick={() => navigate("/")}>
                Go Home
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

