import { isAuthenticated, authHeader } from "../utils/session.js";
import { createOrder } from "../services/orderService.js";
import { getUserCard } from "../services/userService.js";

const CART_STORAGE_KEY = "brinka:cart:v1";
const LAST_ORDER_ID_KEY = "brinka:last-order-id";

async function fetchServerCart() {
    const response = await fetch(
        `${window.BRINKA_CONFIG.API_BASE_URL}/usuarios/carrinho`,
        {
            headers: {
                ...authHeader(),
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Erro ${response.status} ao buscar carrinho.`);
    }

    const data = await response.json();
    const items = data?.items || [];

    const totalQuantity = items.reduce(
        (sum, item) => sum + Number(item.quantidade || 0),
        0
    );

    const total = items.reduce(
        (sum, item) =>
            sum +
            Number(item.preco || 0) * Number(item.quantidade || 0),
        0
    );

    return {
        totalQuantity,
        total,
    };
}

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
const pixPanel = document.getElementById("pix-panel");
const boletoPanel = document.getElementById("boleto-panel");
const methodInputs = Array.from(
    document.querySelectorAll('input[name="payment-method"]')
);

const cardFields = {
    name: document.getElementById("card-name"),
    number: document.getElementById("card-number"),
    expiry: document.getElementById("card-expiry"),
    cvc: document.getElementById("card-cvc"),
};

async function readCart() {
    if (isAuthenticated()) {
        try {
            return await fetchServerCart();
        } catch (error) {
            console.warn(
                "Não foi possível carregar o carrinho do servidor. Tentando localStorage.",
                error
            );
        }
    }

    try {
        const cart = JSON.parse(
            localStorage.getItem(CART_STORAGE_KEY)
        );

        return {
            totalQuantity: Number.isFinite(
                Number(cart?.totalQuantity)
            )
                ? Number(cart.totalQuantity)
                : 0,

            total: Number.isFinite(Number(cart?.total))
                ? Number(cart.total)
                : 0,
        };
    } catch {
        return {
            totalQuantity: 0,
            total: 0,
        };
    }
}

async function renderCartSummary() {
    const cart = await readCart();

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
    const digits = value
        .replace(/\D/g, "")
        .slice(0, 4);

    return digits.length > 2
        ? `${digits.slice(0, 2)}/${digits.slice(2)}`
        : digits;
}

/**
 * Converte a validade ISO retornada pela API:
 *
 * YYYY-MM-DD
 *
 * para:
 *
 * MM/AA
 */
function formatExpiryFromIso(isoDate) {
    if (!isoDate) {
        return "";
    }

    const [year, month] = String(isoDate).split("-");

    if (!year || !month) {
        return "";
    }

    return `${month}/${year.slice(-2)}`;
}

/**
 * Busca o cartão salvo do usuário autenticado
 * e preenche os campos do checkout.
 */
async function prefillSavedCard() {
    if (!isAuthenticated()) {
        return;
    }

    try {
        const card = await getUserCard();

        cardFields.name.value =
            card?.nomeTitular || "";

        cardFields.number.value = maskCardNumber(
            String(card?.numeroCartao || "")
        );

        cardFields.expiry.value =
            formatExpiryFromIso(card?.dataValidade);

        cardFields.cvc.value =
            card?.cvc || "";
    } catch {
        cardFields.name.value = "";
        cardFields.number.value = "";
        cardFields.expiry.value = "";
        cardFields.cvc.value = "";
    }
}

function setFieldError(input, message) {
    const errorId = input.getAttribute("aria-describedby");
    const error = errorId
        ? document.getElementById(errorId)
        : null;

    input.toggleAttribute(
        "aria-invalid",
        Boolean(message)
    );

    if (error) {
        error.textContent = message || "";
    }
}

function validateCreditCard() {
    const errors = [];

    const name = cardFields.name.value.trim();

    const number = cardFields.number.value
        .replace(/\D/g, "");

    const [month, year] =
        cardFields.expiry.value.split("/");

    const cvc = cardFields.cvc.value
        .replace(/\D/g, "");

    const nameError =
        name.length >= 3
            ? ""
            : "Informe o nome completo.";

    const numberError =
        number.length === 16
            ? ""
            : "Informe os 16 dígitos do cartão.";

    const expiryError =
        Number(month) >= 1 &&
        Number(month) <= 12 &&
        /^\d{2}$/.test(year || "")
            ? ""
            : "Informe uma validade no formato MM/AA.";

    const cvcError =
        /^\d{3,4}$/.test(cvc)
            ? ""
            : "Informe um CVC válido.";

    const fields = [
        [cardFields.name, nameError],
        [cardFields.number, numberError],
        [cardFields.expiry, expiryError],
        [cardFields.cvc, cvcError],
    ];

    fields.forEach(([input, message]) => {
        setFieldError(input, message);

        if (message) {
            errors.push({
                input,
                message,
            });
        }
    });

    if (errors.length > 0) {
        const firstError = errors[0];

        firstError.input.focus();
        feedback.textContent = firstError.message;

        return false;
    }

    return true;
}

function syncPaymentMethod() {
  const selectedMethod =
    form.elements["payment-method"].value;

  const isCreditCard = selectedMethod === "credit-card";
  const isPix = selectedMethod === "pix";
  const isBoleto = selectedMethod === "boleto";

  cardPanel.hidden = !isCreditCard;
  cardPanel.setAttribute("aria-hidden", String(!isCreditCard));

  pixPanel.hidden = !isPix;
  pixPanel.setAttribute("aria-hidden", String(!isPix));

  boletoPanel.hidden = !isBoleto;
  boletoPanel.setAttribute("aria-hidden", String(!isBoleto));

  Object.values(cardFields).forEach((field) => {
    field.disabled = !isCreditCard;
  });

  feedback.textContent = "";

  if (isCreditCard) {
    statusRegion.textContent =
      "Preencha os dados do cartão de crédito.";
    return;
  }

  if (isPix) {
    statusRegion.textContent =
      "Pix selecionado. Escaneie o QR Code para simular o pagamento.";
    return;
  }

  statusRegion.textContent =
    "Boleto selecionado. Copie a linha digitável ou escaneie o código de barras para simular o pagamento.";
}

function getPaymentMethod() {
    const selectedMethod =
        form.elements["payment-method"].value;

    return {
        pix: "PIX",
        "credit-card": "CARTAO_CREDITO",
        boleto: "BOLETO",
    }[selectedMethod];
}

cardFields.number.addEventListener("input", () => {
    cardFields.number.value =
        maskCardNumber(cardFields.number.value);
});

cardFields.expiry.addEventListener("input", () => {
    cardFields.expiry.value =
        maskExpiry(cardFields.expiry.value);
});

cardFields.cvc.addEventListener("input", () => {
    cardFields.cvc.value =
        cardFields.cvc.value
            .replace(/\D/g, "")
            .slice(0, 4);
});

methodInputs.forEach((input) => {
    input.addEventListener(
        "change",
        syncPaymentMethod
    );
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    feedback.textContent = "";

    if (!isAuthenticated()) {
        feedback.textContent =
            "Você precisa estar logado para concluir a compra.";

        return;
    }

    submitBtn.disabled = true;

    try {
        const cart = await renderCartSummary();

        if (!cart.totalQuantity) {
            feedback.textContent =
                "Seu carrinho está vazio. Volte ao catálogo para adicionar personagens.";

            submitBtn.disabled = false;
            return;
        }

        const selectedMethod =
            form.elements["payment-method"].value;

        if (
            selectedMethod === "credit-card" &&
            !validateCreditCard()
        ) {
            submitBtn.disabled = false;
            return;
        }

        const metodoPagamento =
            getPaymentMethod();

        if (!metodoPagamento) {
            feedback.textContent =
                "Selecione uma forma de pagamento.";

            submitBtn.disabled = false;
            return;
        }

        statusRegion.textContent =
            "Processando pagamento...";

        const pedido =
            await createOrder(metodoPagamento);

        statusRegion.textContent =
            `Pedido #${pedido.id} confirmado! Pagamento aprovado.`;

        feedback.textContent = "";

        /*
         * O carrinho do usuário autenticado é armazenado
         * no Redis e limpo pelo backend após a criação
         * do pedido.
         *
         * Removemos também o carrinho local para evitar
         * que dados antigos reapareçam.
         */
        localStorage.removeItem(
            CART_STORAGE_KEY
        );

        /*
         * Guarda o último pedido para permitir que a
         * página de confirmação consulte ou exiba os
         * dados correspondentes.
         */
        if (
            pedido?.id !== undefined &&
            pedido?.id !== null
        ) {
            sessionStorage.setItem(
                LAST_ORDER_ID_KEY,
                String(pedido.id)
            );

            window.location.href =
                `pagamento-concluido.html?pedido=${encodeURIComponent(
                    pedido.id
                )}`;
        } else {
            sessionStorage.removeItem(
                LAST_ORDER_ID_KEY
            );

            window.location.href =
                "pagamento-concluido.html";
        }
    } catch (error) {
        console.error(
            "Erro ao finalizar pedido:",
            error
        );

        feedback.textContent =
            error?.message ||
            "Não foi possível concluir o pagamento.";

        statusRegion.textContent =
            "Não foi possível concluir o pagamento.";

        submitBtn.disabled = false;
    }
});

async function initializePaymentPage() {
    try {
        await renderCartSummary();
    } catch (error) {
        console.error(
            "Erro ao carregar resumo do carrinho:",
            error
        );
    }

    await prefillSavedCard();

    syncPaymentMethod();
}

initializePaymentPage();