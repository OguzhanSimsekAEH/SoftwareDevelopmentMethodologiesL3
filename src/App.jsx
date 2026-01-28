import { useEffect, useState } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";

import { CatalogPage } from "./pages/CatalogPage.jsx";
import { OrdersPage } from "./pages/OrdersPage.jsx";
import { CheckoutPage } from "./pages/CheckoutPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";

import { useCart } from "./context/CartContext.jsx";
import { useToast } from "./context/ToastContext.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useUIStore } from "./store/uiStore.js";

import { NotFoundPage } from "./pages/NotFoundPage.jsx";


import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";

export default function App() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const handleLogout = () => {
    logout();
    addToast("Logged out.", "info");
  };

  const themeIcon = theme === "dark" ? "☾" : "☼";
  const themeLabel =
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="topbar" role="banner">
        <div className="app-shell topbar-inner">
          <div className="topbar-brand">
            <div className="topbar-logo" />
            <div>
              <div className="topbar-title">ASTRAL BLOOM</div>
              <div className="topbar-subtitle">
                Warsaw • Same-Day Delivery
              </div>
            </div>
          </div>

          <nav className="topbar-nav" aria-label="Primary navigation">
            <Link
              to="/"
              state={{ section: "catalog" }}
              className="btn btn-ghost"
            >
              Shop
            </Link>

            <Link
              to="/"
              state={{ section: "bouquets" }}
              className="btn btn-ghost"
            >
              Bouquets
            </Link>

            <Link to="/orders" className="btn btn-ghost">
              My Orders
            </Link>

            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setIsCartOpen(true)}
            >
              Cart <span className="badge">{count}</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={toggleTheme}
              aria-label={themeLabel}
            >
              {themeIcon}
            </button>

            {user ? (
              <>
                <Link to="/profile" className="btn btn-ghost">
                  Profile
                </Link>
                <span className="nav-user">
                  Hi, {user.name ?? user.email}
                </span>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">
                  Sign in
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main
        className="app-shell main-layout"
        id="main-content"
        role="main"
      >
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </main>

      {isCartOpen && <CartModal onClose={() => setIsCartOpen(false)} />}

      <ToastHost />
    </>
  );
}

function CartModal({ onClose }) {
  const { items, total, updateQty, removeItem, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) return;
    onClose();
    addToast("Review your details before confirming payment.", "info");
    navigate("/checkout");
  };

  const handleClear = () => {
    if (items.length === 0) return;
    clearCart();
    addToast("Cart cleared.", "info");
  };

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <div
        className="cart-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <header className="cart-modal__header">
          <h2 id="cart-title">Your Cart</h2>
          <button
            className="cart-modal__close"
            onClick={onClose}
            type="button"
            aria-label="Close cart"
          >
            ✕
          </button>
        </header>

        <div className="cart-modal__body">
          {items.length === 0 ? (
            <p className="cart-empty">
              Your cart is empty. Add a bouquet from the catalog to get started.
            </p>
          ) : (
            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.id} className="cart-list__item">
                  <div>
                    <div className="cart-item__name">{item.name}</div>
                    <div className="cart-item__meta">
                      {item.price.toFixed(2)} PLN
                    </div>
                  </div>

                  <div className="cart-stepper">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                    >
                      <FiMinus />
                    </button>
                    <span>{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, +1)}
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="cart-item__total">
                    {(item.price * item.qty).toFixed(2)} PLN
                  </div>

                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                  >
                    <FiTrash2 />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="cart-modal__footer">
          <div className="cart-summary">
            <span>Subtotal</span>
            <span>{total.toFixed(2)} PLN</span>
          </div>
          <div className="cart-actions">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={handleClear}
            >
              Clear cart
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleCheckout}
              disabled={items.length === 0}
            >
              Checkout
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ToastHost() {
  const { toasts, removeToast } = useToast();
  if (!toasts.length) return null;

  return (
    <div className="toast-viewport" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.variant ?? "info"}`}
        >
          <span>{t.message}</span>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
