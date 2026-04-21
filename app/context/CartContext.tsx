"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/app/context/AuthContext";
import type { AddCartItemInput, CartContextType, CartItem } from "./cart/types";
export type { CartItem } from "./cart/types";
import { normalizeVariant, sameCartLine } from "./cart/variant";
import {
  readGuestCartFromStorage,
  removeGuestCartFromStorage,
  writeGuestCartToStorage,
} from "./cart/guestStorage";
import {
  clearServerCart,
  deleteServerItem,
  fetchServerCart,
  mergeGuestCartIntoServer,
  upsertServerQuantity,
} from "./cart/serverCart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuth();
  const userId = user?.id ?? null;

  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  const itemsRef = useRef<CartItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateGuest() {
      setItems(readGuestCartFromStorage());
      setReady(true);
    }

    async function hydrateAuthed(nextUserId: string) {
      setReady(false);

      const guestItems = readGuestCartFromStorage();
      if (guestItems.length) {
        await mergeGuestCartIntoServer(nextUserId, guestItems);
        removeGuestCartFromStorage();
      }

      const serverItems = await fetchServerCart(nextUserId);

      if (cancelled) return;
      setItems(serverItems);
      setReady(true);
    }

    if (!initialized) return;

    if (!userId) {
      void hydrateGuest();
      return;
    }

    void hydrateAuthed(userId);

    return () => {
      cancelled = true;
    };
  }, [initialized, userId]);

  useEffect(() => {
    if (!ready) return;
    if (userId) return;

    writeGuestCartToStorage(items);
  }, [items, ready, userId]);

  function clearLocalCart() {
    removeGuestCartFromStorage();
    setItems([]);
  }

  function addItem(item: AddCartItemInput) {
    const quantityToAdd = Math.max(1, item.quantity ?? 1);
    const variant = normalizeVariant(item.variant);

    const currentQty =
      itemsRef.current.find((row) => sameCartLine(row, item.id, variant))
        ?.quantity ?? 0;

    const nextQty = currentQty + quantityToAdd;

    setItems((currentItems) => {
      const existingItem = currentItems.find((currentItem) =>
        sameCartLine(currentItem, item.id, variant),
      );

      if (existingItem) {
        return currentItems.map((currentItem) =>
          sameCartLine(currentItem, item.id, variant)
            ? { ...currentItem, quantity: currentItem.quantity + quantityToAdd }
            : currentItem,
        );
      }

      return [
        ...currentItems,
        { ...item, quantity: quantityToAdd, variant: variant || undefined },
      ];
    });

    if (userId) {
      void upsertServerQuantity(userId, item.id, variant, nextQty);
    }
  }

  function removeItem(id: string, variant?: string) {
    const normalized = normalizeVariant(variant);

    setItems((currentItems) =>
      currentItems.filter((item) => !sameCartLine(item, id, normalized)),
    );

    if (userId) {
      void deleteServerItem(userId, id, normalized);
    }
  }

  function updateQuantity(id: string, variant: string | undefined, quantity: number) {
    const normalized = normalizeVariant(variant);

    if (quantity <= 0) {
      removeItem(id, normalized);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        sameCartLine(item, id, normalized) ? { ...item, quantity } : item,
      ),
    );

    if (userId) {
      void upsertServerQuantity(userId, id, normalized, quantity);
    }
  }

  function clearCart() {
    setItems([]);

    if (userId) {
      void clearServerCart(userId);
      return;
    }

    clearLocalCart();
  }

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        ready,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        clearLocalCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}