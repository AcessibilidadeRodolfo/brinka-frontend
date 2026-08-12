const LAST_ORDER_ID_KEY = "brinka:last-order-id";

const viewOrderLink = document.getElementById("view-order-link");
const statusRegion = document.getElementById("payment-success-status");
const searchParams = new URLSearchParams(window.location.search);
const orderId = searchParams.get("pedido") || sessionStorage.getItem(LAST_ORDER_ID_KEY);

if (orderId) {
  viewOrderLink.href = `perfil.html?pedido=${encodeURIComponent(orderId)}#purchase-history-title`;
  statusRegion.textContent = `Pedido #${orderId} confirmado e pagamento aprovado.`;
} else {
  statusRegion.textContent = "Pagamento confirmado com sucesso.";
}