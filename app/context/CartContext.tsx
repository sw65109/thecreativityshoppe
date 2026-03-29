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
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/app/context/AuthContext";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type AddCartItemInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

type CartContextType = {
  items: CartItem[];
  ready: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;

  clearCart: () => void;

  clearLocalCart: () => void;
};

const CART_STORAGE_KEY = "the-creativity-shoppe-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

type ProductJoin = {
  id: string;
  name: string;
  price: number | string | null;
  image_url: string | null;
};

type CartItemRow = {
  product_id: string;
  quantity: number;
  products: ProductJoin | ProductJoin[] | null;
};

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

function readGuestCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  return safeParseGuestCart(window.localStorage.getItem(CART_STORAGE_KEY));
}

function removeGuestCartFromStorage() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear cart from local storage:", error);
  }
}

async function fetchServerCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(id, name, price, image_url)")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to load server cart:", error);
    return [];
  }

  const rows = (data ?? []) as unknown as CartItemRow[];

  return rows
    .map((row) => {
      const product = Array.isArray(row.products)
        ? row.products[0]
        : row.products;

      if (!product) return null;

      return {
        id: product.id,
        name: product.name,
        price: Number(product.price ?? 0),
        image: product.image_url ?? "/the_creativity_shoppe1.png",
        quantity: Math.max(1, Number(row.quantity ?? 1)),
      } satisfies CartItem;
    })
    .filter(Boolean) as CartItem[];
}

async function mergeGuestCartIntoServer(userId: string, guestItems: CartItem[]) {
  if (!guestItems.length) return;

  const { data: existing, error: existingError } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("user_id", userId);

  if (existingError) {
    console.error("Failed to read existing server cart:", existingError);
    return;
  }

  const existingMap = new Map<string, number>();
  for (const row of (existing ?? []) as Array<{
    product_id: string;
    quantity: number;
  }>) {
    existingMap.set(row.product_id, Number(row.quantity ?? 0));
  }

  const upsertRows = guestItems.map((item) => {
    const currentQty = existingMap.get(item.id) ?? 0;
    const nextQty = Math.max(1, currentQty + Math.max(1, item.quantity));

    return {
      user_id: userId,
      product_id: item.id,
      quantity: nextQty,
    };
  });

  const { error: upsertError } = await supabase
    .from("cart_items")
    .upsert(upsertRows, { onConflict: "user_id,product_id" });

  if (upsertError) {
    console.error("Failed to merge guest cart into server cart:", upsertError);
  }
}

async function upsertServerQuantity(
  userId: string,
  productId: string,
  quantity: number,
) {
  const nextQty = Math.max(1, quantity);

  const { error } = await supabase.from("cart_items").upsert(
    { user_id: userId, product_id: productId, quantity: nextQty },
    { onConflict: "user_id,product_id" },
  );

  if (error) {
    console.error("Failed to update server cart item:", error);
  }
}

async function deleteServerItem(userId: string, productId: string) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) {
    console.error("Failed to delete server cart item:", error);
  }
}

async function clearServerCart(userId: string) {
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to clear server cart:", error);
  }
}

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

    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart to local storage:", error);
    }
  }, [items, ready, userId]);

  function clearLocalCart() {
    removeGuestCartFromStorage();
    setItems([]);
  }

  function addItem(item: AddCartItemInput) {
    const quantityToAdd = Math.max(1, item.quantity ?? 1);
    const currentQty =
      itemsRef.current.find((row) => row.id === item.id)?.quantity ?? 0;
    const nextQty = currentQty + quantityToAdd;

    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (currentItem) => currentItem.id === item.id,
      );

      if (existingItem) {
        return currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, quantity: currentItem.quantity + quantityToAdd }
            : currentItem,
        );
      }

      return [...currentItems, { ...item, quantity: quantityToAdd }];
    });

    if (userId) {
      void upsertServerQuantity(userId, item.id, nextQty);
    }
  }

  function removeItem(id: string) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));

    if (userId) {
      void deleteServerItem(userId, id);
    }
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      ),
    );

    if (userId) {
      void upsertServerQuantity(userId, id, quantity);
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