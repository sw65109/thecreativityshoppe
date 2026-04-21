import type { CartItem } from "./types";

export const CART_STORAGE_KEY = "the-creativity-shoppe-cart";

function safeParseGuestCart(raw: string | null): CartItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean) as CartItem[];
  } catch {
    return [];
  }
}

export function readGuestCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  return safeParseGuestCart(window.localStorage.getItem(CART_STORAGE_KEY));
}

export function writeGuestCartToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save cart to local storage:", error);
  }
}

export function removeGuestCartFromStorage() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear cart from local storage:", error);
  }
}