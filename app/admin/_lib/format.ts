export function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }
  
  export function formatStatus(status: string | null) {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
  }