export function digitsOnlyPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function formatPhoneNumber(value: string) {
  const digits = digitsOnlyPhone(value);

  if (!digits) {
    return "";
  }

  if (digits.length <= 3) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function formatPhoneNumberForDisplay(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return formatPhoneNumber(value);
}