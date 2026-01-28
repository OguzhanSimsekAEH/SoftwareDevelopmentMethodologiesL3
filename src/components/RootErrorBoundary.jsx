// src/components/RootErrorBoundary.jsx
import React from "react";

export class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error in RootErrorBoundary:", error, info);
  }

  handleRetry = () => {
    // Basit “soft reset”: state'i sıfırla
    // (Bazı hatalarda yine patlayabilir, o zaman reload kullanılır)
    this.setState({ hasError: false });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    // Router hook kullanamayız (class component), en garanti yol:
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="auth-layout" style={{ paddingTop: "2rem" }}>
          <div className="auth-card">
            <h1 className="page-title">500</h1>
            <p className="page-subtitle">
              Something went wrong inside Astral Bloom. Try a quick retry first;
              if that fails, reload the page.
            </p>

            <div className="checkout-actions" style={{ justifyContent: "space-between" }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={this.handleGoHome}
              >
                Back to catalog
              </button>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={this.handleRetry}
                >
                  Retry
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={this.handleReload}
                >
                  Reload page
                </button>
              </div>
            </div>

            <p className="page-subtitle" style={{ marginTop: "0.9rem", fontSize: "0.78rem" }}>
              Tip: If you can reproduce this, check the console for the error log.
            </p>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
