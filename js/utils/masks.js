/**
 * js/utils/masks.js
 * Máscaras de digitação reutilizáveis. Sem dependências externas.
 */

/**
 * Formata um telefone brasileiro enquanto o usuário digita.
 * Aceita fixo (10 dígitos) e celular (11 dígitos).
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
 * Formata um CEP no padrão 00000-000.
 * @param {string} value
 * @returns {string}
 */
export function maskCep(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return digits.replace(/^(\d{5})(\d*)/, "$1-$2");
}

/**
 * Limita e normaliza a sigla de estado (UF) para maiúsculas, 2 letras.
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
 * Aplica uma função de máscara a um <input> a cada evento "input",
 * preservando a posição do cursor no fim do valor (suficiente para os
 * padrões usados neste projeto, que só formatam para a frente).
 * @param {HTMLInputElement} input
 * @param {(value: string) => string} maskFn
 */
export function attachMask(input, maskFn) {
  input.addEventListener("input", () => {
    const masked = maskFn(input.value);
    if (masked !== input.value) input.value = masked;
  });
}
