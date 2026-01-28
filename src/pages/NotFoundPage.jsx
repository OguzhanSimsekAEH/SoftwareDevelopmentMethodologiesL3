// src/pages/NotFoundPage.jsx
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <h1 className="page-title">404</h1>
        <p className="page-subtitle">
          This page drifted into deep space. It doesn’t exist.
        </p>

        <div className="checkout-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/")}
          >
            Back to catalog
          </button>
        </div>
      </div>
    </section>
  );
}
