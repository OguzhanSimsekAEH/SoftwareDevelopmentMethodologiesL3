// src/pages/OrdersPage.jsx
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrders, STATUS_STEPS, cancelOrder } from "../api/orders.js";
import { useToast } from "../context/ToastContext.jsx";

function statusLabel(status) {
  switch (status) {
    case "PREPARING":
      return "Preparing";
    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function statusChipClass(status) {
  if (status === "PREPARING") return "order-chip--blue";
  if (status === "OUT_FOR_DELIVERY") return "order-chip--amber";
  if (status === "DELIVERED") return "order-chip--green";
  return "order-chip--red"; // CANCELLED veya bilinmeyen
}

export function OrdersPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: orders, isLoading, isError, error } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const initialSelectedId = useMemo(() => orders?.[0]?.id ?? null, [orders]);
  const [selectedId, setSelectedId] = useState(null);

  const effectiveSelectedId = selectedId ?? initialSelectedId;
  const selected = orders?.find((o) => o.id === effectiveSelectedId) || null;

  const cancelMutation = useMutation({
    mutationFn: async (orderId) => cancelOrder(orderId),

    onSuccess: (nextOrders) => {
      queryClient.setQueryData(["orders"], nextOrders);
      addToast("Order cancelled.", "success");
    },

    onError: (err) => {
      addToast(err?.message ?? "Cancel failed.", "error");
    },
  });

  const handleCancel = () => {
    if (!selected?.id) return;

    const ok = window.confirm(
      "Cancel this order?\n\nThis is a frontend demo action and cannot be undone."
    );
    if (!ok) return;

    cancelMutation.mutate(selected.id);
  };

  if (isLoading) {
    return (
      <section>
        <section className="orders-hero">
          <div>
            <h1 className="page-title">My orders & delivery status</h1>
            <p className="page-subtitle">Loading your orders...</p>
          </div>
        </section>

        <p className="page-subtitle">Fetching order history (demo)...</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <section className="orders-hero">
          <div>
            <h1 className="page-title">My orders & delivery status</h1>
            <p className="page-subtitle">Could not load orders.</p>
          </div>
        </section>

        <p className="page-subtitle">{error?.message ?? "Unknown error."}</p>
      </section>
    );
  }

  if (!orders?.length) {
    return (
      <section>
        <section className="orders-hero">
          <div>
            <h1 className="page-title">My orders & delivery status</h1>
            <p className="page-subtitle">You have no orders yet.</p>
          </div>
        </section>

        <p className="page-subtitle">
          Place a same-day order from the catalog to see tracking here.
        </p>
      </section>
    );
  }

  return (
    <section>
      <section className="orders-hero">
        <div>
          <h1 className="page-title">My orders & delivery status</h1>
          <p className="page-subtitle">
            Track your recent Astral Bloom orders, see delivery progress in real
            time and review bouquet details for each event.
          </p>
        </div>
        <div className="orders-hero__badge">
          <span>✶</span>
          <span>
            Status updates are refreshed automatically right after payment
            confirmation (frontend demo).
          </span>
        </div>
      </section>

      <section className="orders-layout">
        {/* Sol: sipariş listesi */}
        <div className="orders-list">
          {orders.map((order) => {
            const active = order.id === effectiveSelectedId;
            return (
              <article
                key={order.id}
                className={"order-card" + (active ? " order-card--active" : "")}
                onClick={() => setSelectedId(order.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedId(order.id);
                }}
              >
                <div className="order-card__row">
                  <div>
                    <div className="order-card__title">{order.eventName}</div>
                    <div className="order-card__id">{order.id}</div>
                  </div>
                  <div className="order-card__total">
                    {Number(order.total).toFixed(2)} PLN
                  </div>
                </div>

                <div className="order-card__meta">
                  <span>{order.date}</span>
                  <span>Window: {order.deliveryWindow}</span>
                  <span>{order.eco ? "Eco packaging" : "Standard packaging"}</span>
                </div>

                <div className="order-card__row order-card__row--bottom">
                  <span className={"order-chip " + statusChipClass(order.status)}>
                    {statusLabel(order.status)}
                  </span>
                  <span className="order-card__address">{order.address}</span>
                </div>

                <div className="order-card__items">
                  {(order.items ?? [])
                    .map((item) => `${item.qty} × ${item.name}`)
                    .join(" • ")}
                </div>
              </article>
            );
          })}
        </div>

        {/* Sağ: seçili sipariş detay */}
        <aside className="orders-detail">
          <div className="orders-detail__header">
            <div>
              <h2 className="orders-detail__title">Delivery status</h2>
              <p className="orders-detail__subtitle">
                Live status for the selected order. This is a mocked tracking view
                for the Warsaw delivery zone.
              </p>
            </div>

            <div className="orders-detail__actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCancel}
                disabled={
                  cancelMutation.isPending ||
                  !selected ||
                  selected.status !== "PREPARING"
                }
                aria-disabled={
                  cancelMutation.isPending ||
                  !selected ||
                  selected.status !== "PREPARING"
                }
                title={
                  selected?.status !== "PREPARING"
                    ? "Only PREPARING orders can be cancelled."
                    : "Cancel this order"
                }
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel order"}
              </button>
            </div>
          </div>

          {/* status pill’leri (CANCELLED ise göstermeyi “donuk” yapıyoruz) */}
          <div className="orders-steps" aria-label="Delivery steps">
            {STATUS_STEPS.map((step) => {
              const stepIndex = STATUS_STEPS.indexOf(step);
              const currentIndex =
                selected && STATUS_STEPS.indexOf(selected.status);

              const cancelled = selected?.status === "CANCELLED";
              const active = cancelled ? false : selected && stepIndex <= currentIndex;

              return (
                <div
                  key={step}
                  className={
                    "orders-step-pill" + (active ? " orders-step-pill--active" : "")
                  }
                  style={cancelled ? { opacity: 0.55 } : undefined}
                >
                  <span
                    className={
                      "orders-step-dot" + (active ? " orders-step-dot--active" : "")
                    }
                    style={cancelled ? { opacity: 0.6 } : undefined}
                  />
                  <span>{statusLabel(step)}</span>
                </div>
              );
            })}
          </div>

          {/* meta */}
          <div className="orders-meta-grid">
            <div className="orders-meta-field">
              <span className="orders-meta-label">Order ID</span>
              <span>{selected?.id ?? "—"}</span>
            </div>
            <div className="orders-meta-field">
              <span className="orders-meta-label">Event date</span>
              <span>{selected?.date ?? "—"}</span>
            </div>
            <div className="orders-meta-field">
              <span className="orders-meta-label">Delivery window</span>
              <span>{selected?.deliveryWindow ?? "—"}</span>
            </div>
            <div className="orders-meta-field">
              <span className="orders-meta-label">Address</span>
              <span>{selected?.address ?? "—"}</span>
            </div>
          </div>

          {/* timeline */}
          <h3 className="orders-detail__subtitle" style={{ marginTop: "0.8rem" }}>
            Latest updates
          </h3>

          <ul className="orders-timeline">
            {selected?.updates?.length ? (
              selected.updates.map((u, idx) => (
                <li key={idx} className="orders-timeline__item">
                  <span className="orders-timeline__time">{u.time}</span>
                  <span className="orders-timeline__text">{u.text}</span>
                </li>
              ))
            ) : (
              <li className="orders-timeline__item">
                <span className="orders-timeline__text">
                  No updates available for this order yet.
                </span>
              </li>
            )}
          </ul>
        </aside>
      </section>
    </section>
  );
}
