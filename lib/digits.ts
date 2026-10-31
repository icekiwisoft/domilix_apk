/**
 * Keeps the digits of a typed amount or surface: "1 000", "1,5" or "-5"
 * would reach the API as a string Number() cannot read (NaN) or as a
 * negative value. The fields also open the number pad.
 */
export function digitsOnly(text: string) {
  return text.replace(/\D/g, '');
}

/**
 * Keeps a positive decimal ("1,5" becomes "1.5"): one decimal point at most,
 * so Number() can read it (furniture dimensions and weight).
 */
export function decimalOnly(text: string) {
  const cleaned = text.replace(',', '.').replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  return rest.length ? `${whole}.${rest.join('')}` : whole;
}
