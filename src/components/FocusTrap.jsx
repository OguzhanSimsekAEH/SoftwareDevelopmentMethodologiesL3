// src/components/FocusTrap.jsx
import { useEffect, useRef } from "react";

function getFocusable(container) {
  if (!container) return [];
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  const nodes = Array.from(container.querySelectorAll(selectors));
  return nodes.filter((el) => {
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  });
}

export function FocusTrap({
  active,
  onEscape,
  initialFocusSelector, // opsiyonel: örn ".cart-modal__close"
  children,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;

    const root = ref.current;
    if (!root) return;

    // Modal açılınca focus: ya initialFocusSelector, ya ilk focusable
    const focusables = getFocusable(root);
    const preferred = initialFocusSelector
      ? root.querySelector(initialFocusSelector)
      : null;

    const firstTarget = preferred || focusables[0] || root;
    if (firstTarget && typeof firstTarget.focus === "function") {
      // küçük delay: DOM yerleşsin
      setTimeout(() => firstTarget.focus(), 0);
    }

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        if (onEscape) onEscape();
        return;
      }

      if (e.key !== "Tab") return;

      const list = getFocusable(root);
      if (list.length === 0) {
        e.preventDefault();
        return;
      }

      const first = list[0];
      const last = list[list.length - 1];
      const current = document.activeElement;

      if (e.shiftKey) {
        // Shift+Tab (geri)
        if (current === first || !root.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab (ileri)
        if (current === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, onEscape, initialFocusSelector]);

  return (
    <div ref={ref}>
      {children}
    </div>
  );
}
