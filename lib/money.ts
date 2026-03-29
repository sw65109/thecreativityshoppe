export function toMoneyNumber(value: number) {
    return Number(value.toFixed(2));
  }
  
  export function formatCurrency(value: number | string | null) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value ?? 0));
  }
  
  export function calculateLineTotal(price: number, quantity: number) {
    return toMoneyNumber(price * quantity);
  }
  
  export function calculateCartSubtotal(
    items: Array<{ price: number; quantity: number }>,
  ) {
    return toMoneyNumber(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    );
  }