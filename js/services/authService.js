import { BRINKA_CONFIG } from "../utils/config.js";

const AUTH_URL = `${BRINKA_CONFIG.API_BASE_URL}/auth`;

/**
 * Lê o corpo de uma resposta de erro da API (formato { message: string })
 * e devolve uma mensagem para mostrar na tela.
 * @param {Response} response
 * @returns {Promise<string>}
 */
async function extractErrorMessage(response) {
    try {
      const data = await response.json();
  
      if (data && typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }
  
      if (data && typeof data.error === "string" && data.error.trim()) {
        return data.error;
      }
  
      if (data && typeof data.detail === "string" && data.detail.trim()) {
        return data.detail;
      }
    } catch {
      // Resposta sem JSON
    }
  
    if (response.status === 401) {
      return "E-mail ou senha incorretos.";
    }
  
    if (response.status === 403) {
      return "Acesso não autorizado.";
    }
  
    if (response.status >= 500) {
      return "Erro no servidor. Tente novamente mais tarde.";
    }
  
    return "Não foi possível realizar o login. Tente novamente.";
  }

/**
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<{token: string}>}
 * @throws {Error} com a mensagem de erro devolvida pela API.
 */
export async function login(email, senha) {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        senha,
      }),
    });
  
    if (!response.ok) {
      throw new Error(await extractErrorMessage(response));
    }
  
    return response.json();
  }

/**
 * @param {{ nome: string, telefone: string, email: string, senha: string }} dados
 * @returns {Promise<{token: string}>}
 * @throws {Error} com a mensagem de erro devolvida pela API 
 */
export async function signUp(dados) {
  const response = await fetch(`${AUTH_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}