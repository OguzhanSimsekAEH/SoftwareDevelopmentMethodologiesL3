export async function fetchBouquets() {
  const res = await fetch("/api/bouquets");
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to load bouquets.");
  }
  return res.json();
}
