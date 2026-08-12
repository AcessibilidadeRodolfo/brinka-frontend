import { clearToken, isAuthenticated } from "../utils/session.js";
import { listPurchaseHistory } from "../services/purchaseHistoryService.js";
import {
  getUserProfile,
  updateUserProfile,
  getUserAddress,
  getUserCard,
  updateUserCard,
} from "../services/userService.js";

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR");

const fallbackPurchases = [
  {
    id: "illustrative-order-1",
    status: "Sua compra saiu do ponto de estoque",
    address: "Rua Açucena 424, Jardim das Flores Osasco",
  },
  {
    id: "illustrative-order-2",
    status: "Sua compra está a caminho da sua casa!",
    address: "Rua NoraiNosefinaban Portao 197, Itaquaquecetuba",
  },
];

const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profilePhone = document.getElementById("profile-phone");
const profileAddress = document.getElementById("profile-address");

const historyList = document.getElementById("purchase-history-list");
const historyStatus = document.getElementById("purchase-history-status");
const liveStatus = document.getElementById("profile-live-status");
const logoutButton = document.querySelector('[data-profile-action="logout"]');
const logoutModal = document.getElementById("logout-modal");
const logoutDialog = logoutModal?.querySelector(".logout-modal__dialog");
const logoutConfirmButton = logoutModal?.querySelector("[data-logout-confirm]");
const logoutContinueButton = logoutDialog?.querySelector("[data-logout-cancel]");
const logoutCancelButtons = logoutModal?.querySelectorAll("[data-logout-cancel]") || [];

const cardFields = {
  name: document.getElementById("stored-card-name"),
  number: document.getElementById("stored-card-number"),
  expiry: document.getElementById("stored-card-expiry"),
  cvc: document.getElementById("stored-card-cvc"),
};

let currentCard = null;

if (!isAuthenticated()) {
  window.location.href = "login.html";
}

function maskCardNumber(numero) {
  const digits = String(numero || "").replace(/\D/g, "");
  if (digits.length < 4) return digits;
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

function formatExpiry(isoDate) {
  if (!isoDate) return "";
  const [year, month] = String(isoDate).split("-");
  if (!year || !month) return "";
  return `${month}/${year.slice(-2)}`;
}

function expiryToIsoDate(mmYY) {
  const [month, year] = String(mmYY || "").split("/");
  if (!month || !year) return null;
  const fullYear = 2000 + Number(year);
  const lastDay = new Date(fullYear, Number(month), 0).getDate();
  return `${fullYear}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

function renderProfile(user) {
  profileName.textContent = user.nome;
  profileEmail.textContent = user.email;
  profilePhone.textContent = user.telefone;
}

function renderAddress(address) {
  const partes = [address.rua, address.numero, address.complemento].filter(Boolean).join(", ");
  profileAddress.textContent = `${address.cidade} - ${address.estado}, ${partes}`;
}

function renderCard(card) {
  currentCard = card;
  cardFields.name.value = card.nomeTitular || "";
  cardFields.number.value = maskCardNumber(card.numeroCartao);
  cardFields.expiry.value = formatExpiry(card.dataValidade);
  cardFields.cvc.value = "•••";
}

async function loadProfile() {
  try {
    const user = await getUserProfile();
    renderProfile(user);
  } catch (error) {
    liveStatus.textContent = error.message;
  }
}

async function loadAddress() {
  try {
    const address = await getUserAddress();
    renderAddress(address);
  } catch {
    profileAddress.textContent = "Nenhum endereço cadastrado.";
  }
}

async function loadCard() {
  try {
    const card = await getUserCard();
    renderCard(card);
  } catch {
    cardFields.name.value = "";
    cardFields.number.value = "Nenhum cartão cadastrado";
    cardFields.expiry.value = "";
    cardFields.cvc.value = "";
  }
}

function createPurchaseItem(order) {
  const item = document.createElement("li");
  const card = document.createElement("article");
  const content = document.createElement("div");
  const title = document.createElement("h3");
  const details = document.createElement("p");
  const routeButton = document.createElement("button");

  const isRealOrder = typeof order.id === "number" && Array.isArray(order.itens);

  item.className = "purchase-history__item";
  card.className = "purchase-card";

  if (isRealOrder) {
    title.textContent = `Pedido #${order.id} — ${order.status}`;
    const dataPedido = order.dataPedido ? dateFormatter.format(new Date(order.dataPedido)) : "";
    details.textContent = `${order.itens.length} ite${order.itens.length === 1 ? "m" : "ns"} • ${moneyFormatter.format(order.total)}${dataPedido ? ` • ${dataPedido}` : ""}`;
    routeButton.textContent = "Ver detalhes";
    routeButton.setAttribute("aria-label", `Ver detalhes do pedido #${order.id}`);
    routeButton.addEventListener("click", () => {
      liveStatus.textContent = `Pedido #${order.id}: ${order.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(", ")}.`;
    });
  } else {
    title.textContent = order.status;
    details.textContent = order.address;
    routeButton.textContent = "Ver rota";
    routeButton.setAttribute("aria-label", `Ver rota da compra: ${order.status}`);
    routeButton.addEventListener("click", () => {
      liveStatus.textContent = "O rastreamento será aberto quando o backend de compras estiver conectado.";
    });
  }

  content.append(title, details);
  card.append(content, routeButton);
  item.append(card);
  return item;
}

function renderPurchases(purchases) {
  if (!purchases.length) {
    historyList.replaceChildren();
    historyStatus.textContent = "Você ainda não possui compras no histórico.";
    return;
  }

  historyList.replaceChildren(...purchases.map(createPurchaseItem));
}

async function loadPurchaseHistory() {
  try {
    const result = await listPurchaseHistory(fallbackPurchases);
    renderPurchases(result.purchases);
    historyStatus.textContent = "";

    if (result.source === "fallback") {
      liveStatus.textContent = "Histórico ilustrativo enquanto o backend não está conectado.";
    }
  } catch (error) {
    console.error("Erro ao carregar histórico de compras:", error);
    renderPurchases(fallbackPurchases);
    historyStatus.textContent = "Não foi possível atualizar o histórico. Exibindo informações ilustrativas.";
  }
}

document.querySelector('[data-profile-action="update-profile"]')?.addEventListener("click", async () => {
  const nome = window.prompt("Nome completo:", profileName.textContent.trim());
  if (nome === null) return;

  const telefone = window.prompt("Telefone (ex: 11950646508):", profilePhone.textContent.trim());
  if (telefone === null) return;

  try {
    const user = await updateUserProfile({ nome, telefone });
    renderProfile(user);
    liveStatus.textContent = "Dados do perfil atualizados.";
  } catch (error) {
    liveStatus.textContent = error.message;
  }
});

document.querySelectorAll(".stored-card__edit").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("stored-card__edit--name")) {
      cardFields.name.readOnly = false;
      cardFields.name.value = currentCard?.nomeTitular || "";
      cardFields.name.focus();
    } else if (button.classList.contains("stored-card__edit--number")) {
      cardFields.number.readOnly = false;
      cardFields.number.value = currentCard?.numeroCartao || "";
      cardFields.number.focus();
    } else if (button.classList.contains("stored-card__edit--expiry")) {
      cardFields.expiry.readOnly = false;
      cardFields.cvc.readOnly = false;
      cardFields.cvc.value = "";
      cardFields.expiry.focus();
    }
  });
});

document.querySelector('[data-profile-action="update-card"]')?.addEventListener("click", async () => {
  const payload = {};

  if (!cardFields.name.readOnly) payload.nome_titular = cardFields.name.value.trim();
  if (!cardFields.number.readOnly) payload.numero_cartao = cardFields.number.value.replace(/\D/g, "");
  if (!cardFields.expiry.readOnly) {
    const isoDate = expiryToIsoDate(cardFields.expiry.value);
    if (!isoDate) {
      liveStatus.textContent = "Informe a validade no formato MM/AA.";
      return;
    }
    payload.data_validade = isoDate;
  }
  if (!cardFields.cvc.readOnly) payload.cvc = cardFields.cvc.value.trim();

  if (!Object.keys(payload).length) {
    liveStatus.textContent = "Nenhuma alteração para salvar. Toque no ✎ do campo que deseja editar.";
    return;
  }

  try {
    const card = await updateUserCard(payload);
    renderCard(card);
    [cardFields.name, cardFields.number, cardFields.expiry, cardFields.cvc].forEach((field) => {
      field.readOnly = true;
    });
    liveStatus.textContent = "Dados do cartão atualizados.";
  } catch (error) {
    liveStatus.textContent = error.message;
  }
});

function closeLogoutModal({ restoreFocus = true } = {}) {
  if (!logoutModal) return;

  logoutModal.setAttribute("aria-hidden", "true");
  logoutModal.inert = true;
  document.body.classList.remove("has-logout-modal");

  if (restoreFocus) logoutButton?.focus();
}

function openLogoutModal() {
  if (!logoutModal) return;

  logoutModal.inert = false;
  logoutModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-logout-modal");
  setTimeout(() => logoutContinueButton?.focus(), 0);
}

logoutButton?.addEventListener("click", openLogoutModal);

logoutCancelButtons.forEach((button) => {
  button.addEventListener("click", () => closeLogoutModal());
});

logoutConfirmButton?.addEventListener("click", () => {
  closeLogoutModal({ restoreFocus: false });
  clearToken();
  window.location.href = "login.html";
});

logoutModal?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeLogoutModal();
    return;
  }

  if (event.key !== "Tab" || !logoutDialog) return;

  const focusableElements = [...logoutDialog.querySelectorAll("button:not([disabled])")];
  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement?.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement?.focus();
  }
});

void loadProfile();
void loadAddress();
void loadCard();
void loadPurchaseHistory();
