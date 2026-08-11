
const VIA_CEP_URL = "https://viacep.com.br/ws";

/**
 * @param {string} cep 
 * @returns {Promise<{uf: string, cidade: string, bairro: string, rua: string} | null>}
 * @throws {Error} quando a requisição falha (rede indisponível, etc.).
 */
export async function buscarEnderecoPorCep(cep) {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) {
    throw new Error("CEP deve conter 8 dígitos.");
  }

  const response = await fetch(`${VIA_CEP_URL}/${digits}/json/`);
  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP agora.");
  }

  const data = await response.json();
  if (data.erro) return null;

  return {
    uf: data.uf ?? "",
    cidade: data.localidade ?? "",
    bairro: data.bairro ?? "",
    rua: data.logradouro ?? "",
  };
}
