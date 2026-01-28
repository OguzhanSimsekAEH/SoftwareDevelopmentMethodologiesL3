import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // Aynı ürünü eklerse adedi artır
  const addItem = (product) =>
    setItems((prev) => {
      const existing = prev.find((it) => it.id === product.id);
      if (existing) {
        return prev.map((it) =>
          it.id === product.id ? { ...it, qty: it.qty + 1 } : it
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });

  // qty +-1 (0 veya altı olursa satırı atıyoruz)
  const updateQty = (id, delta) =>
    setItems((prev) =>
      prev
        .map((it) =>
          it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it
        )
        .filter((it) => it.qty > 0)
    );

  // satırı tamamen sil
  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const clearCart = () => setItems([]);

  const count = items.reduce((sum, it) => sum + it.qty, 0);
  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQty,
      removeItem,
      clearCart,
      count,
      total,
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
