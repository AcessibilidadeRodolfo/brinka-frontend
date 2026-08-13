import { authHeader } from "../utils/session.js";

function getOrdersUrl() {
  return `${window.BRINKA_CONFIG.API_BASE_URL}/pedidos`;
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

  if (response.status === 400) {
    return "Não foi possível concluir o pagamento. Verifique seus dados e tente novamente.";
  }

  if (response.status >= 500) {
    return "Erro no servidor. Tente novamente mais tarde.";
  }

  return "Não foi possível concluir o pagamento. Tente novamente.";
}

/**
 * Cria um pedido a partir do carrinho do usuário autenticado.
 * @param {"PIX" | "CARTAO_CREDITO" | "BOLETO"} metodo_pagamento
 * @returns {Promise<object>} o pedido criado, com itens, pagamento e total.
 * @throws {Error} com a mensagem de erro devolvida pela API.
 */
export async function createOrder(metodo_pagamento) {
  const response = await fetch(getOrdersUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ metodo_pagamento }),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return response.json();
}
