import type { CartItem } from "./types";

export function normalizeVariant(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function sameCartLine(item: CartItem, id: string, variant: string) {
  return item.id === id && normalizeVariant(item.variant) === variant;
}