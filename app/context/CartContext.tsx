"use client";

import {
  createContext,
  useCallback,
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
  const serverWriteChain = useRef<Promise<unknown>>(Promise.resolve());

  const commitItems = useCallback((next: CartItem[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  function enqueueServerWrite(task: () => Promise<unknown>) {
    serverWriteChain.current = serverWriteChain.current.then(task, task);
  }

  useEffect(() => {
    let cancelled = false;

    async function hydrateGuest() {
      commitItems(readGuestCartFromStorage());
      setReady(true);
    }

    async function hydrateAuthed(nextUserId: string) {
      setReady(false);

      const guestItems = readGuestCartFromStorage();
      if (guestItems.length) {
        const merged = await mergeGuestCartIntoServer(nextUserId, guestItems);
        if (merged) {
          removeGuestCartFromStorage();
        }
      }

      const serverItems = await fetchServerCart(nextUserId);

      if (cancelled) return;
      commitItems(serverItems);
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
  }, [initialized, userId, commitItems]);

  useEffect(() => {
    if (!ready) return;
    if (userId) return;

    writeGuestCartToStorage(items);
  }, [items, ready, userId]);

  function clearLocalCart() {
    removeGuestCartFromStorage();
    commitItems([]);
  }

  function addItem(item: AddCartItemInput) {
    const quantityToAdd = Math.max(1, item.quantity ?? 1);
    const variant = normalizeVariant(item.variant);

    const current = itemsRef.current;
    const existing = current.find((row) => sameCartLine(row, item.id, variant));
    const nextQty = (existing?.quantity ?? 0) + quantityToAdd;

    const next = existing
      ? current.map((row) =>
          sameCartLine(row, item.id, variant) ? { ...row, quantity: nextQty } : row,
        )
      : [
          ...current,
          { ...item, quantity: quantityToAdd, variant: variant || undefined },
        ];

    commitItems(next);

    if (userId) {
      enqueueServerWrite(() => upsertServerQuantity(userId, item.id, variant, nextQty));
    }
  }

  function removeItem(id: string, variant?: string) {
    const normalized = normalizeVariant(variant);

    commitItems(
      itemsRef.current.filter((item) => !sameCartLine(item, id, normalized)),
    );

    if (userId) {
      enqueueServerWrite(() => deleteServerItem(userId, id, normalized));
    }
  }

  function updateQuantity(id: string, variant: string | undefined, quantity: number) {
    const normalized = normalizeVariant(variant);

    if (quantity <= 0) {
      removeItem(id, normalized);
      return;
    }

    commitItems(
      itemsRef.current.map((item) =>
        sameCartLine(item, id, normalized) ? { ...item, quantity } : item,
      ),
    );

    if (userId) {
      enqueueServerWrite(() => upsertServerQuantity(userId, id, normalized, quantity));
    }
  }

  function clearCart() {
    commitItems([]);

    if (userId) {
      enqueueServerWrite(() => clearServerCart(userId));
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