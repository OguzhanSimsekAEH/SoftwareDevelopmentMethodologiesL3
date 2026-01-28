const STATUS_STEPS = ["PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

function getToken() {
  return localStorage.getItem("astral_bloom_token");
}

export async function fetchOrders() {
  const token = getToken();
  if (!token) return [];

  const res = await fetch("/api/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to load orders.");
  }

  return res.json();
}

export async function cancelOrder(orderId) {
  const token = getToken();
  if (!token) throw new Error("Please sign in first.");

  const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Cancel failed.");
  }

  const updated = await res.json();
  const current = await fetchOrders();
  return current.map((o) => (o.id === updated.id ? updated : o));
}

export function prependOrder() {
  return null;
}

export { STATUS_STEPS };
