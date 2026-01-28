
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export function ProfilePage() {
  const { user, isAuthLoading, updateProfile, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  if (isAuthLoading) {
    return (
      <section className="auth-layout">
        <div className="auth-card">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Loading your profile...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="auth-layout">
        <div className="auth-card">
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">
            You need to sign in before accessing your profile settings.
          </p>
          <div className="checkout-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/login")}
            >
              Go to sign in
            </button>
          </div>
        </div>
      </section>
    );
  }

  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [defaultAddress, setDefaultAddress] = useState(
    user.defaultAddress ?? ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    updateProfile({
      name: name.trim() || null,
      phone: phone.trim() || null,
      defaultAddress: defaultAddress.trim() || null,
    });

    addToast("Profile updated (local demo).", "success");
  };

  const handleLogout = () => {
    logout();
    addToast("Signed out.", "success");
    navigate("/");
  };

  return (
    <section className="auth-layout">
      <div className="auth-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "baseline",
          }}
        >
          <div>
            <h1 className="page-title">Profile settings</h1>
            <p className="page-subtitle">
              Manage your contact and default delivery details used for same-day
              orders in Warsaw.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleLogout}
            title="Sign out"
          >
            Log out
          </button>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-field">
            <label htmlFor="email">Email (read-only)</label>
            <input id="email" type="email" value={user.email} disabled />
          </div>

          <div className="checkout-field">
            <label htmlFor="name">Display name</label>
            <input
              id="name"
              type="text"
              placeholder="How we address you"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="checkout-field">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              placeholder="+48 ..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="checkout-field">
            <label htmlFor="defaultAddress">Default delivery address</label>
            <textarea
              id="defaultAddress"
              rows={3}
              placeholder="Street, building number, floor, venue..."
              value={defaultAddress}
              onChange={(e) => setDefaultAddress(e.target.value)}
            />
          </div>

          <div className="checkout-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/")}
            >
              Back to catalog
            </button>
            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
          </div>

          <p className="checkout-hint" style={{ marginTop: "0.6rem" }}>
            Note: Saving profile fields is currently local-only. If you want,
            we’ll add a backend endpoint to persist these to Postgres.
          </p>
        </form>
      </div>
    </section>
  );
}
