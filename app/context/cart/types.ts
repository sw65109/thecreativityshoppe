export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
};

export type AddCartItemInput = Omit<CartItem, "quantity"> & {
  quantity?: number;
};

export type CartContextType = {
  items: CartItem[];
  ready: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (id: string, variant?: string) => void;
  updateQuantity: (id: string, variant: string | undefined, quantity: number) => void;
  clearCart: () => void;
  clearLocalCart: () => void;
};