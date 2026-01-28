// src/components/CatalogSkeleton.jsx
export function CatalogSkeleton({ count = 6 }) {
  return (
    <div className="catalog-grid" style={{ marginTop: "1.4rem" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="product-card skeleton-card">
          <div className="skeleton skeleton-image" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text short" />
          <div className="skeleton skeleton-button" />
        </div>
      ))}
    </div>
  );
}
