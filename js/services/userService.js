import { authHeader } from "../utils/session.js";

function getUsersUrl() {
  return `${window.BRINKA_CONFIG.API_BASE_URL}/usuarios`;
}

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
  } catch {
    // Resposta sem JSON
  }

  if (response.status === 401) {
    return "Sua sessão expirou. Faça login novamente.";
  }

  if (response.status === 403) {
    return "Acesso não autorizado.";
  }

  if (response.status === 404) {
    return "Nenhum dado cadastrado.";
  }

  if (response.status >= 500) {
    return "Erro no servidor. Tente novamente mais tarde.";
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}

/**
 * @returns {Promise<{id: number, nome: string, email: string, telefone: string}>}
 * @throws {Error} com a mensagem de erro devolvida pela API.
 */
export async function getUserProfile() {
  const response = await fetch(getUsersUrl(), {
    headers: { ...authHeader() },
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}

/**
 * @param {{ nome?: string, telefone?: string }} dados
 * @returns {Promise<{id: number, nome: string, email: string, telefone: string}>}
 * @throws {Error} com a mensagem de erro devolvida pela API.
 */
export async function updateUserProfile(dados) {
  const response = await fetch(getUsersUrl(), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}

/**
 * @returns {Promise<{cep: string, rua: string, numero: number, complemento: string, cidade: string, estado: string}>}
 * @throws {Error} com a mensagem de erro devolvida pela API.
 */
export async function getUserAddress() {
  const response = await fetch(`${getUsersUrl()}/address`, {
    headers: { ...authHeader() },
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}

/**
 * @param {{ cep?: string, rua?: string, numero?: string, complemento?: string, cidade?: string, estado?: string }} dados
 * @returns {Promise<{cep: string, rua: string, numero: number, complemento: string, cidade: string, estado: string}>}
 * @throws {Error} com a mensagem de erro devolvida pela API.
 */
export async function updateUserAddress(dados) {
  const response = await fetch(`${getUsersUrl()}/address`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}

/**
 * @returns {Promise<{id: number, numeroCartao: string, nomeTitular: string, cvc: string, dataValidade: string}>}
 * @throws {Error} com a mensagem de erro devolvida pela API.
 */
export async function getUserCard() {
  const response = await fetch(`${getUsersUrl()}/cartao`, {
    headers: { ...authHeader() },
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}

/**
 * @param {{ numero_cartao?: string, nome_titular?: string, data_validade?: string, cvc?: string }} dados
 * @returns {Promise<{id: number, numeroCartao: string, nomeTitular: string, cvc: string, dataValidade: string}>}
 * @throws {Error} com a mensagem de erro devolvida pela API.
 */
export async function updateUserCard(dados) {
  const response = await fetch(`${getUsersUrl()}/cartao`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}
