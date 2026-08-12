import { isAuthenticated } from "../utils/session.js";
import { createOrder } from "../services/orderService.js";

const CART_STORAGE_KEY = "brinka:cart:v1";
const LAST_ORDER_ID_KEY = "brinka:last-order-id";

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const form = document.getElementById("payment-form");
const submitBtn = form.querySelector(".payment-submit");
const itemCount = document.getElementById("payment-item-count");
const total = document.getElementById("payment-total");
const feedback = document.getElementById("payment-feedback");
const statusRegion = document.getElementById("payment-status");
const cardPanel = document.getElementById("credit-card-panel");
const methodInputs = Array.from(
  document.querySelectorAll('input[name="payment-method"]')
);

const cardFields = {
  name: document.getElementById("card-name"),
  number: document.getElementById("card-number"),
  expiry: document.getElementById("card-expiry"),
  cvc: document.getElementById("card-cvc"),
};

function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return {
      totalQuantity: Number.isFinite(Number(cart?.totalQuantity))
        ? Number(cart.totalQuantity)
        : 0,
      total: Number.isFinite(Number(cart?.total)) ? Number(cart.total) : 0,
    };
  } catch {
    return { totalQuantity: 0, total: 0 };
  }
}

function renderCartSummary() {
  const cart = readCart();
  itemCount.textContent = String(cart.totalQuantity);
  total.textContent = moneyFormatter.format(cart.total);
  return cart;
}

function maskCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function maskExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function setFieldError(input, message) {
  const error = document.getElementById(input.getAttribute("aria-describedby"));
  input.toggleAttribute("aria-invalid", Boolean(message));
  if (error) error.textContent = message || "";
}

function validateCreditCard() {
  const errors = [];
  const name = cardFields.name.value.trim();
  const number = cardFields.number.value.replace(/\D/g, "");
  const [month, year] = cardFields.expiry.value.split("/");
  const cvc = cardFields.cvc.value.replace(/\D/g, "");

  const nameError = name.length >= 3 ? "" : "Informe o nome completo.";
  const numberError = number.length === 16 ? "" : "Informe os 16 dígitos do cartão.";
  const expiryError =
    Number(month) >= 1 && Number(month) <= 12 && /^\d{2}$/.test(year || "")
      ? ""
      : "Informe uma validade no formato MM/AA.";
  const cvcError = /^\d{3,4}$/.test(cvc) ? "" : "Informe um CVC válido.";

  [
    [cardFields.name, nameError],
    [cardFields.number, numberError],
    [cardFields.expiry, expiryError],
    [cardFields.cvc, cvcError],
  ].forEach(([input, message]) => {
    setFieldError(input, message);
    if (message) errors.push({ input, message });
  });

  if (errors.length) {
    errors[0].input.focus();
    feedback.textContent = errors[0].message;
    return false;
  }

  return true;
}

function syncPaymentMethod() {
  const selectedMethod = form.elements["payment-method"].value;
  const isCreditCard = selectedMethod === "credit-card";

  cardPanel.hidden = !isCreditCard;
  cardPanel.setAttribute("aria-hidden", String(!isCreditCard));
  Object.values(cardFields).forEach((field) => {
    field.disabled = !isCreditCard;
  });
  feedback.textContent = "";
  statusRegion.textContent = isCreditCard
    ? "Preencha os dados do cartão de crédito."
    : `${selectedMethod === "pix" ? "Pix" : "Boleto"} selecionado.`;
}

cardFields.number.addEventListener("input", () => {
  cardFields.number.value = maskCardNumber(cardFields.number.value);
});

cardFields.expiry.addEventListener("input", () => {
  cardFields.expiry.value = maskExpiry(cardFields.expiry.value);
});

cardFields.cvc.addEventListener("input", () => {
  cardFields.cvc.value = cardFields.cvc.value.replace(/\D/g, "").slice(0, 4);
});

methodInputs.forEach((input) => input.addEventListener("change", syncPaymentMethod));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  feedback.textContent = "";

  if (!isAuthenticated()) {
    feedback.textContent = "Você precisa estar logado para concluir a compra.";
    return;
  }

  const cart = renderCartSummary();
  if (!cart.totalQuantity) {
    feedback.textContent = "Seu carrinho está vazio. Volte ao catálogo para adicionar personagens.";
    return;
  }

  const selectedMethod = form.elements["payment-method"].value;
  if (selectedMethod === "credit-card" && !validateCreditCard()) return;

  const metodoPagamento = {
    pix: "PIX",
    "credit-card": "CARTAO_CREDITO",
    boleto: "BOLETO",
  }[selectedMethod];

  submitBtn.disabled = true;
  statusRegion.textContent = "Processando pagamento...";

  try {
    const pedido = await createOrder(metodoPagamento);
    statusRegion.textContent = `Pedido #${pedido.id} confirmado! Pagamento aprovado.`;
    feedback.textContent = "";
    localStorage.removeItem(CART_STORAGE_KEY);

    if (pedido?.id !== undefined && pedido?.id !== null) {
      sessionStorage.setItem(LAST_ORDER_ID_KEY, String(pedido.id));
      window.location.href = `pagamento-concluido.html?pedido=${encodeURIComponent(pedido.id)}`;
    } else {
      sessionStorage.removeItem(LAST_ORDER_ID_KEY);
      window.location.href = "pagamento-concluido.html";
    }
  } catch (error) {
    feedback.textContent = error.message;
    statusRegion.textContent = "Não foi possível concluir o pagamento.";
    submitBtn.disabled = false;
  }
});

renderCartSummary();
syncPaymentMethod();
