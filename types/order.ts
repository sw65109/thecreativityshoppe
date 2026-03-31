export const ORDER_STATUS_OPTIONS = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;

export type KnownOrderStatus = (typeof ORDER_STATUS_OPTIONS)[number];
export type OrderStatus = KnownOrderStatus | string;

export interface CheckoutAddress {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export interface OrderWithItems {
  id: string;
  order_number: number;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  is_gift: boolean | null;
  shipping_address: CheckoutAddress | null;
  billing_address: CheckoutAddress | null;
  status: OrderStatus;
  total: number;
  created_at: string;
  order_items: OrderItem[] | null;
}

export interface CreateOrderItemInput {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
}

export interface CreateOrderInput {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  isGift?: boolean;
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress | null;
  status?: OrderStatus;
  items: CreateOrderItemInput[];
}

export interface CreateOrderFunctionItemInput {
  productId: string;
  quantity: number;
  variant?: string;
}

export interface CreateOrderFunctionInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  isGift?: boolean;
  shippingAddress: CheckoutAddress;
  billingAddress?: CheckoutAddress | null;
  items: CreateOrderFunctionItemInput[];
}

export interface CreateOrderFunctionResult {
  orderId: string;
  orderNumber: number;
  total: number;
  itemCount: number;
}