
/**
 * @param {string} value
 * @returns {string}
 */
export function maskTelefone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits.replace(/^(\d*)/, "($1");
  if (digits.length <= 6) {
    return digits.replace(/^(\d{2})(\d*)/, "($1) $2");
  }
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d*)/, "($1) $2-$3");
  }
  return digits.replace(/^(\d{2})(\d{5})(\d*)/, "($1) $2-$3");
}

/**
 * @param {string} value
 * @returns {string}
 */
export function maskCep(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return digits.replace(/^(\d{5})(\d*)/, "$1-$2");
}

/**
 * @param {string} value
 * @returns {string}
 */
export function maskUf(value) {
  return value
    .replace(/[^a-zA-Zà-úÀ-Ú]/g, "")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * @param {HTMLInputElement} input
 * @param {(value: string) => string} maskFn
 */
export function attachMask(input, maskFn) {
  input.addEventListener("input", () => {
    const masked = maskFn(input.value);
    if (masked !== input.value) input.value = masked;
  });
}
