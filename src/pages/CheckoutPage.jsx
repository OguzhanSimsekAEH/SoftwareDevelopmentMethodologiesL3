import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

import { placeOrder } from "../api/checkout.js";

const DELIVERY_WINDOWS = ["17:30–18:30", "18:00–19:00", "19:00–20:00"];

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [address, setAddress] = useState(user?.defaultAddress ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [deliveryWindow, setDeliveryWindow] = useState(DELIVERY_WINDOWS[0]);
  const [note, setNote] = useState("");

  const [touched, setTouched] = useState({
    fullName: false,
    address: false,
  });

  const canSubmit = useMemo(() => {
    return items.length > 0 && fullName.trim() && address.trim();
  }, [items.length, fullName, address]);

  const fullNameError =
    touched.fullName && !fullName.trim() ? "Full name is required." : "";

  const addressError =
    touched.address && !address.trim() ? "Delivery address is required." : "";

  const mutation = useMutation({
    mutationFn: async (order) => placeOrder(order),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });

      clearCart();
      addToast("Order placed successfully.", "success");
      navigate("/orders");
    },

    onError: (err) => {
      addToast(err?.message ?? "Checkout failed.", "error");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched({ fullName: true, address: true });

    if (!canSubmit) {
      addToast(
        "Please fill required fields and ensure your cart is not empty.",
        "error"
      );
      return;
    }

    mutation.mutate({
      fullName,
      phone,
      address,
      deliveryWindow,
      note,
      items,
      total,
      userEmail: user?.email ?? null,
    });
  };

  return (
    <section className="checkout-layout">
      <section className="checkout-main">
        <h1 className="page-title">Checkout</h1>
        <p className="page-subtitle">
          Confirm delivery details for Warsaw same-day delivery. Payment is
          stubbed in this frontend demo.
        </p>

        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <div className="checkout-field">
            <label htmlFor="fullName">Full name *</label>
            <input
              id="fullName"
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
              aria-invalid={Boolean(fullNameError)}
              required
            />
            {fullNameError && (
              <p className="form-error" role="alert">
                {fullNameError}
              </p>
            )}
          </div>

          <div className="checkout-two-column">
            <div className="checkout-field">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                placeholder="+48 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="deliveryWindow">Delivery window</label>
              <select
                id="deliveryWindow"
                value={deliveryWindow}
                onChange={(e) => setDeliveryWindow(e.target.value)}
              >
                {DELIVERY_WINDOWS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <p className="checkout-hint">
                (Stub) In a real backend, we would validate slot availability.
              </p>
            </div>
          </div>

          <div className="checkout-field">
            <label htmlFor="address">Delivery address *</label>
            <textarea
              id="address"
              rows={3}
              placeholder="Street, building number, floor, venue..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, address: true }))}
              aria-invalid={Boolean(addressError)}
              required
            />
            {addressError && (
              <p className="form-error" role="alert">
                {addressError}
              </p>
            )}
          </div>

          <div className="checkout-field">
            <label htmlFor="note">Note</label>
            <textarea
              id="note"
              rows={3}
              placeholder="Optional note for courier / florist..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="checkout-gateway-note">
            <span className="checkout-gateway-pill">PayU</span>
            <span>
              Payment is mocked in this demo. Clicking “Place order” simulates a
              server request via React Query mutation.
            </span>
          </div>

          <div className="checkout-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate("/")}
              disabled={mutation.isPending}
              aria-disabled={mutation.isPending}
            >
              Back to catalog
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={mutation.isPending}
              aria-disabled={!canSubmit || mutation.isPending}
            >
              {mutation.isPending ? "Placing order..." : "Place order"}
            </button>
          </div>
        </form>
      </section>

      <aside className="checkout-summary">
        <h2>Order summary</h2>

        {items.length === 0 ? (
          <p className="page-subtitle">Your cart is empty.</p>
        ) : (
          <ul className="checkout-summary-list">
            {items.map((item) => (
              <li key={item.id} className="checkout-summary-item">
                <div>
                  <div className="checkout-summary-name">{item.name}</div>
                  <div className="checkout-summary-meta">
                    {item.qty} × {item.price.toFixed(2)} PLN
                    {item.size ? ` • ${item.size}` : ""}
                    {item.ecoOnly ? " • Eco" : ""}
                  </div>
                </div>
                <div className="checkout-summary-total">
                  {(item.qty * item.price).toFixed(2)} PLN
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="checkout-summary-footer">
          <span>Total</span>
          <span>{total.toFixed(2)} PLN</span>
        </div>
      </aside>
    </section>
  );
}
