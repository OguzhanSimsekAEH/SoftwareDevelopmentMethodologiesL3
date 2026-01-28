function getToken() {
  return localStorage.getItem("astral_bloom_token");
}

export async function placeOrder(order) {
  const token = getToken();
  if (!token) throw new Error("Please sign in first.");

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(order),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Checkout failed.");
  }

  return res.json();
}
