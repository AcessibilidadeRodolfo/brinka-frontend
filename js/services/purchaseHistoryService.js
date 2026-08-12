import { authHeader } from "../utils/session.js";

function normalizePurchases(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.purchases)) return data.purchases;
  if (Array.isArray(data?.orders)) return data.orders;
  return [];
}

/**
 * Consulta o histórico quando uma URL for configurada. Enquanto não houver
 * endpoint, mantém a página utilizável com os itens ilustrativos recebidos.
 * @param {Array<{id: string, status: string, address: string}>} fallbackPurchases
 * @returns {Promise<{purchases: Array, source: "api" | "fallback"}>}
 */
export async function listPurchaseHistory(fallbackPurchases = []) {
  const url = String(window.BRINKA_CONFIG?.PURCHASE_HISTORY_URL || "").trim();
  if (!url) return { purchases: fallbackPurchases, source: "fallback" };

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...authHeader(),
    },
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar o histórico de compras.");
  }

  return {
    purchases: normalizePurchases(await response.json()),
    source: "api",
  };
}
