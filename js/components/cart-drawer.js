(function () {
    const moneyFormatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const cartStorageKey = 'brinka:cart:v1';
    const cart = new Map();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lastAddedId = null;

    function roundMoney(value) {
        return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
    }

    function normalizeProduct(product) {
        const id = String(product?.id || '').trim();
        const price = Number(product?.price);

        if (!id || !Number.isFinite(price) || price < 0) return null;

        return {
            id,
            name: String(product.name || id),
            image: String(product.image || ''),
            price: roundMoney(price),
            color: String(product.color || '')
        };
    }

    function getTotalQuantity() {
        return Array.from(cart.values()).reduce((total, item) => total + item.quantity, 0);
    }

    function getTotalPrice() {
        const total = Array.from(cart.values()).reduce((sum, item) => {
            return sum + (item.product.price * item.quantity);
        }, 0);

        return roundMoney(total);
    }

    function getCartSnapshot() {
        const items = Array.from(cart.values()).map(({ product, quantity }) => ({
            id: product.id,
            name: product.name,
            image: product.image,
            color: product.color,
            unitPrice: roundMoney(product.price),
            quantity,
            lineTotal: roundMoney(product.price * quantity)
        }));
        const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));

        return {
            version: 1,
            currency: 'BRL',
            items,
            totalQuantity: getTotalQuantity(),
            subtotal,
            total: subtotal
        };
    }

    function saveCart() {
        const snapshot = getCartSnapshot();

        try {
            localStorage.setItem(cartStorageKey, JSON.stringify(snapshot));
        } catch {
            // O carrinho continua funcionando em memória se o navegador bloquear o armazenamento.
        }

        return snapshot;
    }

    function restoreCart() {
        try {
            const savedCart = JSON.parse(localStorage.getItem(cartStorageKey));
            if (!Array.isArray(savedCart?.items)) return;

            savedCart.items.forEach(savedItem => {
                const product = normalizeProduct({
                    id: savedItem.id,
                    name: savedItem.name,
                    image: savedItem.image,
                    color: savedItem.color,
                    price: savedItem.unitPrice
                });
                const quantity = Number.parseInt(savedItem.quantity, 10);

                if (product && Number.isInteger(quantity) && quantity > 0) {
                    cart.set(product.id, { product, quantity });
                }
            });
        } catch {
            try {
                localStorage.removeItem(cartStorageKey);
            } catch {
                // Sem ação: o navegador também pode bloquear a remoção.
            }
        }
    }

    function createActionButton(action, product, label, content) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = action === 'remove' ? 'cart-remove-button' : 'cart-quantity-button';
        button.dataset.action = action;
        button.dataset.productId = product.id;
        button.setAttribute('aria-label', label);

        if (action === 'remove') {
            button.innerHTML = `
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M8 6V4h8v2"></path>
                    <path d="M19 6l-1 14H6L5 6"></path>
                </svg>
            `;
        } else {
            button.textContent = content;
        }

        return button;
    }

    function createCartItem(item) {
        const { product, quantity } = item;
        const row = document.createElement('li');
        const detailsButton = document.createElement('button');
        const imageWrap = document.createElement('span');
        const image = document.createElement('img');
        const info = document.createElement('span');
        const name = document.createElement('span');
        const price = document.createElement('strong');
        const controls = document.createElement('div');
        const quantityValue = document.createElement('span');

        row.className = 'cart-item';
        row.dataset.productId = product.id;
        if (product.id === lastAddedId) row.classList.add('is-entering');

        detailsButton.type = 'button';
        detailsButton.className = 'cart-item-open';
        detailsButton.dataset.action = 'details';
        detailsButton.dataset.productId = product.id;
        detailsButton.setAttribute('aria-label', `Ver detalhes de ${product.name}`);

        imageWrap.className = 'cart-item-image';
        imageWrap.style.setProperty('--item-color', product.color || 'var(--accent)');
        image.src = product.image;
        image.alt = `Miniatura de ${product.name}`;

        info.className = 'cart-item-info';
        name.className = 'cart-item-name';
        price.className = 'cart-item-price';
        name.textContent = product.name;
        const lineTotalText = moneyFormatter.format(roundMoney(product.price * quantity));
        price.textContent = lineTotalText;
        price.setAttribute('aria-label', `Subtotal de ${product.name}: ${lineTotalText}`);

        controls.className = 'cart-item-controls';
        quantityValue.className = 'cart-item-quantity';
        quantityValue.textContent = String(quantity);
        quantityValue.setAttribute('aria-label', `Quantidade: ${quantity}`);

        controls.append(
            createActionButton('increase', product, `Aumentar quantidade de ${product.name}`, '+'),
            quantityValue,
            createActionButton('decrease', product, `Diminuir quantidade de ${product.name}`, '−'),
            createActionButton('remove', product, `Remover ${product.name} do carrinho`)
        );

        imageWrap.append(image);
        info.append(name, price);
        detailsButton.append(imageWrap, info);
        row.append(detailsButton, controls);
        return row;
    }

    function isLoggedIn() {
        return Boolean(window.brinkaSession?.isAuthenticated?.());
    }

    /*
     * Guarda a cor (colorFrom) de cada produto assim que ele é adicionado
     * pela UI (character-card.js manda `color` no evento cart:add). O
     * backend não guarda essa informação (é só decoração visual), então
     * usamos esse cache pra manter a cor do item mesmo depois de sincronizar
     * com o servidor.
     */
    const colorCache = new Map();

    /** Chama a brinka-api anexando o token (quando existir) e tratando erros comuns. */
    async function apiRequest(path, options = {}) {
        const baseUrl = (window.BRINKA_CONFIG?.API_BASE_URL || '').replace(/\/$/, '');
        if (!baseUrl) throw new Error('API não configurada (window.BRINKA_CONFIG.API_BASE_URL).');

        const response = await fetch(`${baseUrl}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(window.brinkaSession?.authHeader?.() || {}),
                ...(options.headers || {})
            }
        });

        if (response.status === 401) {
            window.brinkaSession?.clearToken?.();
            throw new Error('Sessão expirada.');
        }

        if (!response.ok) {
            throw new Error(`Erro ${response.status} ao acessar ${path}`);
        }

        return response.status === 204 ? null : response.json();
    }

    /** Reconstrói o Map local a partir de um CartResponse vindo da API ({ items, total }). */
    function applyServerCart(cartResponse, { animate = false } = {}) {
        cart.clear();

        (cartResponse?.items || []).forEach(item => {
            const id = String(item.productId);
            const product = normalizeProduct({
                id,
                name: item.nome,
                image: item.imagem,
                price: item.preco,
                color: colorCache.get(id) || ''
            });

            if (product) cart.set(id, { product, quantity: item.quantidade });
        });

        renderCart(animate);
        document.dispatchEvent(new CustomEvent('cart:updated', {
            detail: { cart: getCartSnapshot() }
        }));
    }

    function initCartDrawer() {
        const openButton = document.querySelector('.btn-cart');
        const overlay = document.querySelector('.cart-overlay');
        const drawer = overlay?.querySelector('.cart-drawer');
        const closeButton = overlay?.querySelector('.cart-drawer-close');
        const emptyState = overlay?.querySelector('.cart-empty');
        const itemList = overlay?.querySelector('.cart-items');
        const totalValue = overlay?.querySelector('.cart-total');
        const checkoutButton = overlay?.querySelector('.cart-checkout');
        const count = document.querySelector('.cart-count');
        const liveRegion = overlay?.querySelector('.cart-live-region');
        const footerCartLink = document.querySelector('.footer-cart-link');
        let lastOpenTrigger = openButton;

        if (!openButton || !overlay || !drawer || !closeButton || !emptyState || !itemList || !totalValue || !count) {
            return;
        }

        function announce(message) {
            if (liveRegion) liveRegion.textContent = message;
        }

        function animateCounter() {
            count.classList.remove('is-bumping');
            void count.offsetWidth;
            count.classList.add('is-bumping');
        }

        function renderCart(shouldAnimateCount = false) {
            const items = Array.from(cart.values());
            const totalQuantity = getTotalQuantity();
            const isEmpty = items.length === 0;

            emptyState.hidden = !isEmpty;
            itemList.hidden = isEmpty;
            itemList.replaceChildren(...items.map(createCartItem));
            totalValue.textContent = moneyFormatter.format(getTotalPrice());
            count.textContent = String(totalQuantity);
            openButton.setAttribute('aria-label', `Carrinho, ${totalQuantity} ${totalQuantity === 1 ? 'item' : 'itens'}`);
            if (checkoutButton) checkoutButton.disabled = isEmpty;

            if (shouldAnimateCount) animateCounter();
            lastAddedId = null;
        }

        function syncCart(shouldAnimateCount = false) {
            const snapshot = saveCart();
            renderCart(shouldAnimateCount);
            document.dispatchEvent(new CustomEvent('cart:updated', {
                detail: { cart: snapshot }
            }));
            return snapshot;
        }

        function openDrawer(trigger = openButton) {
            if (overlay.classList.contains('is-open')) return;

            lastOpenTrigger = trigger;
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.setProperty('--cart-scrollbar-compensation', `${scrollbarWidth}px`);
            document.body.classList.add('cart-drawer-open');
            overlay.removeAttribute('inert');
            overlay.classList.add('is-open');
            overlay.setAttribute('aria-hidden', 'false');
            openButton.setAttribute('aria-expanded', 'true');
            requestAnimationFrame(() => closeButton.focus());
        }

        function closeDrawer() {
            if (!overlay.classList.contains('is-open')) return;

            overlay.classList.remove('is-open');
            lastOpenTrigger?.focus();
            overlay.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('inert', '');
            openButton.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('cart-drawer-open');
            document.body.style.removeProperty('--cart-scrollbar-compensation');
            lastOpenTrigger = openButton;
        }

        function removeItem(productId, row) {
            const item = cart.get(productId);
            if (!item) return;

            const finishRemoval = async () => {
                cart.delete(productId);

                if (isLoggedIn()) {
                    try {
                        await apiRequest(`/usuarios/carrinho/${encodeURIComponent(productId)}`, { method: 'DELETE' });
                    } catch (err) {
                        console.warn('Não foi possível remover o item no servidor.', err);
                    }

                    renderCart();
                    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: getCartSnapshot() } }));
                } else {
                    syncCart();
                }

                announce(`${item.product.name} removido do carrinho.`);
            };

            if (reduceMotion.matches || !row) {
                finishRemoval();
                return;
            }

            row.classList.add('is-removing');
            row.querySelectorAll('button').forEach(button => { button.disabled = true; });
            window.setTimeout(finishRemoval, 220);
        }

        async function addProduct(productData) {
            const product = normalizeProduct(productData);
            if (!product) return;
            if (product.color) colorCache.set(product.id, product.color);

            if (isLoggedIn()) {
                try {
                    const serverCart = await apiRequest(`/usuarios/carrinho?productId=${encodeURIComponent(product.id)}`, { method: 'POST' });
                    lastAddedId = product.id;
                    applyServerCart(serverCart, { animate: true });
                    announce(`${product.name} adicionado ao carrinho.`);
                    return getCartSnapshot();
                } catch (err) {
                    console.warn('Não foi possível adicionar o item no servidor, adicionando localmente.', err);
                }
            }

            const currentItem = cart.get(product.id);
            cart.set(product.id, {
                product,
                quantity: currentItem ? currentItem.quantity + 1 : 1
            });

            lastAddedId = product.id;
            const snapshot = syncCart(true);
            announce(`${product.name} adicionado ao carrinho.`);
            return snapshot;
        }

        async function increaseProduct(productId) {
            const item = cart.get(productId);
            if (!item) return null;

            if (isLoggedIn()) {
                try {
                    const serverCart = await apiRequest(`/usuarios/carrinho/${encodeURIComponent(productId)}?operation=ADD`, { method: 'PATCH' });
                    applyServerCart(serverCart, { animate: true });
                    announce(`Quantidade de ${item.product.name} atualizada.`);
                    return getCartSnapshot();
                } catch (err) {
                    console.warn('Não foi possível atualizar a quantidade no servidor.', err);
                }
            }

            item.quantity += 1;
            const snapshot = syncCart(true);
            announce(`Quantidade de ${item.product.name}: ${item.quantity}.`);
            return snapshot;
        }

        async function decreaseProduct(productId, row = null) {
            const item = cart.get(productId);
            if (!item) return null;

            if (item.quantity === 1) {
                removeItem(productId, row);
                return getCartSnapshot();
            }

            if (isLoggedIn()) {
                try {
                    const serverCart = await apiRequest(`/usuarios/carrinho/${encodeURIComponent(productId)}?operation=REMOVE`, { method: 'PATCH' });
                    applyServerCart(serverCart, { animate: true });
                    announce(`Quantidade de ${item.product.name} atualizada.`);
                    return getCartSnapshot();
                } catch (err) {
                    console.warn('Não foi possível atualizar a quantidade no servidor.', err);
                }
            }

            item.quantity -= 1;
            const snapshot = syncCart(true);
            announce(`Quantidade de ${item.product.name}: ${item.quantity}.`);
            return snapshot;
        }

        function removeProduct(productId, row = null) {
            if (!cart.has(productId)) return null;

            removeItem(productId, row);
            return getCartSnapshot();
        }

        document.addEventListener('cart:add', event => {
            const product = event.detail?.product;
            if (product?.id) addProduct(product);
        });

        openButton.addEventListener('click', () => openDrawer(openButton));
        footerCartLink?.addEventListener('click', event => {
            event.preventDefault();
            openDrawer(footerCartLink);
        });
        closeButton.addEventListener('click', closeDrawer);

        overlay.addEventListener('click', event => {
            if (event.target === overlay) closeDrawer();
        });

        itemList.addEventListener('click', event => {
            const button = event.target.closest('button[data-action]');
            if (!button) return;

            const { action, productId } = button.dataset;
            const item = cart.get(productId);
            if (!item) return;

            if (action === 'details') {
                button.dispatchEvent(new CustomEvent('character:open-details', {
                    bubbles: true,
                    detail: {
                        productId,
                        trigger: button,
                        source: 'cart'
                    }
                }));
            } else if (action === 'increase') {
                increaseProduct(productId);
            } else if (action === 'decrease') {
                decreaseProduct(productId, button.closest('.cart-item'));
            } else if (action === 'remove') {
                removeProduct(productId, button.closest('.cart-item'));
            }
        });

        checkoutButton?.addEventListener('click', () => {
            if (!cart.size) return;

            const order = getCartSnapshot();
            document.dispatchEvent(new CustomEvent('cart:checkout', {
                detail: { order }
            }));
            announce(`Resumo da compra preparado. Total ${moneyFormatter.format(order.total)}.`);
        });

        drawer.addEventListener('keydown', event => {
            if (event.key !== 'Tab') return;

            const focusable = Array.from(drawer.querySelectorAll('button:not(:disabled)'));
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;
            if (document.querySelector('.product-details-overlay.is-open')) return;

            closeDrawer();
        });

        async function loadInitialCart() {
            if (isLoggedIn()) {
                try {
                    const serverCart = await apiRequest('/usuarios/carrinho', { method: 'GET' });
                    applyServerCart(serverCart);
                    return;
                } catch (err) {
                    console.warn('Não foi possível carregar o carrinho do servidor, usando carrinho local.', err);
                }
            }

            restoreCart();
            syncCart();
        }

        loadInitialCart();

        window.brinkaCart = Object.freeze({
            storageKey: cartStorageKey,
            getSnapshot: getCartSnapshot,
            add: addProduct,
            increase: increaseProduct,
            decrease: decreaseProduct,
            remove: removeProduct,
            clear() {
                const idsToRemove = Array.from(cart.keys());

                if (isLoggedIn()) {
                    idsToRemove.forEach(id => {
                        apiRequest(`/usuarios/carrinho/${encodeURIComponent(id)}`, { method: 'DELETE' })
                            .catch(err => console.warn('Não foi possível remover item no servidor.', err));
                    });
                    cart.clear();
                    renderCart(true);
                    const snapshot = getCartSnapshot();
                    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: snapshot } }));
                    announce('Carrinho esvaziado.');
                    return snapshot;
                }

                cart.clear();
                const snapshot = syncCart(true);
                announce('Carrinho esvaziado.');
                return snapshot;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', initCartDrawer);
})();
