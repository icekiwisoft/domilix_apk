/**
 * Keeps the digits of a typed amount or surface: "1 000", "1,5" or "-5"
 * would reach the API as a string Number() cannot read (NaN) or as a
 * negative value. The fields also open the number pad.
 */
export function digitsOnly(text: string) {
  return text.replace(/\D/g, '');
}
