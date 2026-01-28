// src/pages/CatalogPage.jsx
import { useMemo, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { FocusTrap } from "../components/FocusTrap.jsx";

// ----- Demo katalog verisi -----
const BOUQUETS = [
  {
    id: "vistula-morning",
    name: "Vistula Morning",
    price: 120,
    defaultSize: "SMALL",
    eco: true,
    tags: ["Everyday", "Pastel", "Same-day"],
    description:
      "Soft pastel bouquet for intimate breakfasts and daylight gatherings.",
    imageUrl:
      "https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "warsaw-wedding-classic",
    name: "Warsaw Wedding Classic",
    price: 338,
    defaultSize: "MEDIUM",
    eco: true,
    tags: ["Wedding", "Roses", "Bridal", "Same-day"],
    description:
      "Cream and white roses with greenery for timeless Warsaw weddings.",
    imageUrl:
      "https://images.pexels.com/photos/265947/pexels-photo-265947.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "corporate-event-standout",
    name: "Corporate Event Standout",
    price: 544,
    defaultSize: "LARGE",
    eco: false,
    tags: ["Corporate", "Lobby", "Formal", "Same-day"],
    description:
      "Tall centrepiece designed for lobbies, gala halls and conferences.",
    imageUrl:
      "https://images.pexels.com/photos/931167/pexels-photo-931167.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "praga-night",
    name: "Praga Night",
    price: 273,
    defaultSize: "MEDIUM",
    eco: false,
    tags: ["Evening", "Bold", "Night", "Same-day"],
    description:
      "Moody, dark-toned bouquet tuned for jazz bars and late-night venues.",
    imageUrl:
      "https://images.pexels.com/photos/5946994/pexels-photo-5946994.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

const CATEGORY_FILTERS = [
  { id: "all", label: "All" },
  { id: "same-day", label: "Same-day" },
  { id: "wedding", label: "Wedding" },
  { id: "corporate", label: "Corporate" },
  { id: "evening", label: "Evening" },
  { id: "everyday", label: "Everyday" },
];

const SIZE_OPTIONS = [
  { id: "any", label: "Any" },
  { id: "SMALL", label: "Small" },
  { id: "MEDIUM", label: "Medium" },
  { id: "LARGE", label: "Large" },
];

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low → high" },
  { id: "price-desc", label: "Price: high → low" },
  { id: "name-asc", label: "Name A → Z" },
];

export function CatalogPage() {
  const { addItem } = useCart();
  const { addToast } = useToast();

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState("any");
  const [ecoOnly, setEcoOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const [activeBouquet, setActiveBouquet] = useState(null);
  const [customForm, setCustomForm] = useState({
    size: "SMALL",
    ecoOnly: false,
    notes: "",
  });

  const openCustomiseModal = (bouquet) => {
    setActiveBouquet(bouquet);
    setCustomForm({
      size: bouquet.defaultSize,
      ecoOnly: bouquet.eco,
      notes: "",
    });
  };

  const closeCustomiseModal = () => {
    setActiveBouquet(null);
  };

  const handleCustomFormChange = (field, value) => {
    setCustomForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddCustomToCart = () => {
    if (!activeBouquet) return;

    addItem({
      id: activeBouquet.id,
      name: activeBouquet.name,
      price: activeBouquet.price,
      size: customForm.size,
      ecoOnly: customForm.ecoOnly,
      notes: customForm.notes,
    });

    addToast(`"${activeBouquet.name}" has been added to your cart.`, "success");
    setActiveBouquet(null);
  };

  const filteredBouquets = useMemo(
    () =>
      BOUQUETS.filter((b) => {
        if (ecoOnly && !b.eco) return false;

        if (category !== "all") {
          const catLabel = CATEGORY_FILTERS.find((c) => c.id === category)?.label;
          if (!catLabel) return false;
          const tagsLower = b.tags.map((t) => t.toLowerCase());
          if (!tagsLower.includes(catLabel.toLowerCase())) return false;
        }

        if (sizeFilter !== "any" && b.defaultSize !== sizeFilter) return false;

        if (search.trim()) {
          const q = search.trim().toLowerCase();
          const haystack = [b.name, b.description, b.tags.join(" "), b.defaultSize]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }

        return true;
      }).sort((a, b) => {
        switch (sortBy) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "name-asc":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      }),
    [category, ecoOnly, sizeFilter, search, sortBy]
  );

  return (
    <main className="main-layout" aria-labelledby="catalog-heading">
      {/* HERO */}
      <section className="catalog-hero">
        <div className="catalog-hero__text">
          <h1 id="catalog-heading" className="page-title">
            Celestial bouquets for Warsaw nights
          </h1>
          <p>
            Design eco-conscious arrangements for galas, weddings and late-night
            events across the city skies.
          </p>
          <p>
            Each bouquet is prepared with <strong>recyclable packaging</strong>{" "}
            and tuned for <strong>same-day delivery</strong> within Warsaw.
          </p>

          <div className="same-day-banner">
            <span className="same-day-pill">Same-day delivery</span>
            <span>
              Today&apos;s constellation is reserved just for your event. Orders
              close at 17:00.
            </span>
          </div>
        </div>

        <div className="catalog-hero__image" aria-hidden="true" role="img"></div>
      </section>

      {/* CATALOG HEADER + FILTERS */}
      <section aria-label="Catalog">
        <header style={{ marginTop: "1.6rem", marginBottom: "0.4rem" }}>
          <h2 className="page-title" style={{ fontSize: "1.2rem" }}>
            Catalog
          </h2>
          <p className="page-subtitle">
            Curated bouquets for weddings, corporate events, intimate dinners
            and late-night gatherings in Warsaw.
          </p>
        </header>

        <div className="catalog-controls">
          <div className="catalog-categories" aria-label="Categories">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={"chip" + (category === cat.id ? " chip--active" : "")}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="catalog-filters" aria-label="Filters">
            <div className="catalog-search">
              <label
                htmlFor="catalog-search"
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.15rem",
                }}
              >
                Search
              </label>
              <input
                id="catalog-search"
                type="search"
                placeholder="Search by name, tag, event type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="catalog-size"
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.15rem",
                }}
              >
                Size
              </label>
              <select
                id="catalog-size"
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="catalog-sort-select"
              >
                {SIZE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="catalog-eco-toggle">
              <span
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Options
              </span>
              <input
                id="eco-only"
                type="checkbox"
                checked={ecoOnly}
                onChange={(e) => setEcoOnly(e.target.checked)}
              />
              <label htmlFor="eco-only">Eco only</label>
            </div>

            <div>
              <label
                htmlFor="catalog-sort"
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "0.15rem",
                }}
              >
                Sort
              </label>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="catalog-sort-select"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* GRID */}
        <div className="catalog-grid" style={{ marginTop: "1.4rem" }}>
          {filteredBouquets.map((bouquet) => (
            <article key={bouquet.id} className="product-card" aria-label={bouquet.name}>
              <div className="product-card__image-wrapper">
                <img
                  src={bouquet.imageUrl}
                  alt={bouquet.name}
                  className="product-card__image"
                />
              </div>

              <div className="product-card__title-row">
                <h3 className="product-card__title">{bouquet.name}</h3>
                <div className="product-card__price">{bouquet.price.toFixed(2)} PLN</div>
              </div>

              <div className="product-card__tags">
                {bouquet.eco && <span className="tag-pill tag-pill--eco">Eco</span>}
                {bouquet.tags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="product-card__description">{bouquet.description}</p>

              <div className="product-card__footer">
                <span>Default size: {bouquet.defaultSize}</span>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => openCustomiseModal(bouquet)}
                >
                  Customise &amp; add to cart
                </button>
              </div>
            </article>
          ))}

          {filteredBouquets.length === 0 && (
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
              No bouquets match your filters. Try relaxing one of the options.
            </p>
          )}
        </div>
      </section>

      {/* CUSTOMISE MODAL (WCAG light) */}
      {activeBouquet && (
        <FocusTrap
          active={Boolean(activeBouquet)}
          onEscape={closeCustomiseModal}
          initialFocusSelector=".cart-modal__close"
        >
          <div
            className="cart-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customise-title"
            aria-describedby="customise-desc"
            onMouseDown={(e) => {
              // backdrop click => close
              if (e.target === e.currentTarget) closeCustomiseModal();
            }}
          >
            <div
              className="cart-modal"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="cart-modal__header">
                <h2 id="customise-title">Customise bouquet</h2>

                <button
                  type="button"
                  className="cart-modal__close"
                  onClick={closeCustomiseModal}
                  aria-label="Close customise modal"
                >
                  ✕
                </button>
              </div>

              <p id="customise-desc" className="sr-only">
                Choose bouquet size, eco packaging option and an optional note for the florist. Press Escape to close this dialog.
              </p>

              <div
                className="cart-modal__body"
                style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}
              >
                <p style={{ fontSize: "0.85rem" }}>
                  <strong>{activeBouquet.name}</strong> – default size{" "}
                  {activeBouquet.defaultSize}
                </p>

                <div className="checkout-two-column">
                  <div className="checkout-field">
                    <label htmlFor="custom-size">Size</label>
                    <select
                      id="custom-size"
                      value={customForm.size}
                      onChange={(e) => handleCustomFormChange("size", e.target.value)}
                    >
                      <option value="SMALL">Small</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LARGE">Large</option>
                    </select>
                  </div>

                  <div className="checkout-field">
                    <label>Eco options</label>
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontSize: "0.85rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={customForm.ecoOnly}
                        onChange={(e) =>
                          handleCustomFormChange("ecoOnly", e.target.checked)
                        }
                      />
                      Use recyclable packaging only
                    </label>
                  </div>
                </div>

                <div className="checkout-field">
                  <label htmlFor="custom-notes">Notes for florist</label>
                  <textarea
                    id="custom-notes"
                    rows={3}
                    placeholder="Optional: colour preference, allergies, venue details..."
                    value={customForm.notes}
                    onChange={(e) => handleCustomFormChange("notes", e.target.value)}
                  />
                </div>
              </div>

              <div className="cart-modal__footer">
                <div className="cart-summary">
                  <span>Estimated total</span>
                  <span>{activeBouquet.price.toFixed(2)} PLN</span>
                </div>

                <div className="cart-actions">
                  <button type="button" className="btn btn-ghost" onClick={closeCustomiseModal}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleAddCustomToCart}>
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FocusTrap>
      )}
    </main>
  );
}
