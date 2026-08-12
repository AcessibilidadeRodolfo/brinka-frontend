import { clearToken } from "../utils/session.js";
import { listPurchaseHistory } from "../services/purchaseHistoryService.js";

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

const historyList = document.getElementById("purchase-history-list");
const historyStatus = document.getElementById("purchase-history-status");
const liveStatus = document.getElementById("profile-live-status");
const logoutButton = document.querySelector('[data-profile-action="logout"]');
const logoutModal = document.getElementById("logout-modal");
const logoutDialog = logoutModal?.querySelector(".logout-modal__dialog");
const logoutConfirmButton = logoutModal?.querySelector("[data-logout-confirm]");
const logoutContinueButton = logoutDialog?.querySelector("[data-logout-cancel]");
const logoutCancelButtons = logoutModal?.querySelectorAll("[data-logout-cancel]") || [];

function createPurchaseItem(purchase) {
  const item = document.createElement("li");
  const card = document.createElement("article");
  const content = document.createElement("div");
  const title = document.createElement("h3");
  const address = document.createElement("p");
  const routeButton = document.createElement("button");

  item.className = "purchase-history__item";
  card.className = "purchase-card";
  title.textContent = purchase.status;
  address.textContent = purchase.address;
  routeButton.type = "button";
  routeButton.textContent = "Ver rota";
  routeButton.setAttribute("aria-label", `Ver rota da compra: ${purchase.status}`);
  routeButton.addEventListener("click", () => {
    liveStatus.textContent = "O rastreamento será aberto quando o backend de compras estiver conectado.";
  });

  content.append(title, address);
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

document.querySelector('[data-profile-action="update-profile"]')?.addEventListener("click", () => {
  liveStatus.textContent = "A atualização do perfil estará disponível após a integração com o backend.";
});

document.querySelector('[data-profile-action="update-card"]')?.addEventListener("click", () => {
  liveStatus.textContent = "A atualização do cartão estará disponível após a integração com o backend.";
});

document.querySelectorAll(".stored-card__edit").forEach((button) => {
  button.addEventListener("click", () => {
    liveStatus.textContent = "A edição do cartão estará disponível após a integração com o backend.";
  });
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

void loadPurchaseHistory();
