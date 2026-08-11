const TOKEN_KEY = "brinka_token";

/**
 * @param {string} token
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * @returns {string | null}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * @returns {boolean}
 */
export function isAuthenticated() {
  return Boolean(getToken());
}

/**
 * @returns {Record<string, string>}
 */
export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/*
 * Também expõe essas funções em window.brinkaSession para que scripts
 * clássicos (não-módulo), como cart-drawer.js, consigam checar login e
 * montar o header Authorization sem precisar de `import`.
 */
window.brinkaSession = { setToken, getToken, clearToken, isAuthenticated, authHeader };
