(function () {
    const moneyFormatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const fallbackProducts = [
        {
            id: 'mari-marrao',
            name: 'Mari Marrão',
            category: 'classicos',
            colorFrom: '#DF7A96',
            colorTo: '#F6356B',
            image: 'assets/images/mari-marrao.png',
            description: 'Com sua boina branca e jardineira jeans, Mari leva imaginação, carinho e boas histórias para qualquer aventura.',
            price: 69.99,
            averageRating: 3.4,
            comments: [
                { name: 'Erick Santos Silva', text: 'A personagem é linda e chegou em perfeito estado!', rating: 4 },
                { name: 'Lara Oliveira', text: 'Muito fofa, a qualidade é excelente.', rating: 5 }
            ]
        },
        {
            id: 'erick-santos',
            name: 'Erick Santos',
            category: 'classicos',
            colorFrom: '#26AACE',
            colorTo: '#287488',
            image: 'assets/images/erick-santos.png',
            description: 'Erick está sempre pronto para registrar momentos especiais e espalhar energia positiva por onde passa.',
            price: 69.99,
            averageRating: 4.6,
            comments: [
                { name: 'Nanda Nagata', text: 'O detalhe do celular ficou muito legal.', rating: 5 },
                { name: 'João Souza', text: 'Meu personagem favorito da coleção.', rating: 4 }
            ]
        },
        {
            id: 'rahquel-emido',
            name: 'Rahquel Emido',
            category: 'especiais',
            colorFrom: '#A9852C',
            colorTo: '#D4B13A',
            image: 'assets/images/rahquel-korzh.png',
            description: 'Rahquel combina curiosidade, estilo e uma coleção de ideias brilhantes para tornar cada dia mais divertido.',
            price: 69.99,
            averageRating: 4.8,
            comments: [
                { name: 'Mari Marrão', text: 'Os óculos e a roupa ficaram perfeitos.', rating: 5 },
                { name: 'Samuel Rocha', text: 'Uma versão muito caprichada.', rating: 5 }
            ]
        },
        {
            id: 'joao-souza',
            name: 'João Souza',
            category: 'classicos',
            colorFrom: '#ADBF35',
            colorTo: '#676F2C',
            image: 'assets/images/joao-souza.png',
            description: 'João chega com bom humor, muita criatividade e disposição para participar de todas as brincadeiras.',
            price: 69.99,
            averageRating: 4.2,
            comments: [
                { name: 'Isepe Nic', text: 'Muito bem feito e cheio de personalidade.', rating: 4 },
                { name: 'Vinícius Boas', text: 'Adorei as cores do personagem.', rating: 4 }
            ]
        },
        {
            id: 'vinicius-boas',
            name: 'Vinícius Boas',
            category: 'novos',
            colorFrom: '#AA4B19',
            colorTo: '#FF823F',
            image: 'assets/images/vini-vilas.png',
            description: 'Vinícius traz seu café, seus óculos e um jeito descontraído de aproveitar cada encontro com os amigos.',
            price: 69.99,
            averageRating: 4.5,
            comments: [
                { name: 'Rahquel Emido', text: 'Os detalhes do café ficaram incríveis.', rating: 5 },
                { name: 'Erick Santos', text: 'A expressão ficou muito parecida.', rating: 4 }
            ]
        },
        {
            id: 'isepe-nic',
            name: 'Isepe Nic',
            category: 'especiais',
            colorFrom: '#864ECE',
            colorTo: '#4C2085',
            image: 'assets/images/isepe.png',
            description: 'Isepe mistura leveza, criatividade e uma energia contagiante para colecionar bons momentos.',
            price: 69.99,
            averageRating: 4.7,
            comments: [
                { name: 'João Souza', text: 'As cores ficaram muito bonitas.', rating: 5 },
                { name: 'Nanda Nagata', text: 'Quero mais personagens nesse estilo.', rating: 4 }
            ]
        },
        {
            id: 'samuel',
            name: 'Samuel',
            category: 'promocoes',
            colorFrom: '#AA1919',
            colorTo: '#DC6767',
            image: 'assets/images/samuca.png',
            description: 'Samuel é tranquilo, divertido e tem um visual marcante para completar a coleção de personagens.',
            price: 69.99,
            averageRating: 4.3,
            comments: [
                { name: 'Mari Marrão', text: 'Ficou muito fofo e bem detalhado.', rating: 4 },
                { name: 'Vinícius Boas', text: 'Ótimo presente para quem gosta da coleção.', rating: 5 }
            ]
        },
        {
            id: 'nanda',
            name: 'Nanda Nagata',
            category: 'novos',
            colorFrom: '#0C9A93',
            colorTo: '#0C7A75',
            image: 'assets/images/nanda.png',
            description: 'Nanda chega com alto-astral e muita confiança para deixar a coleção ainda mais colorida.',
            price: 69.99,
            averageRating: 4.9,
            comments: [
                { name: 'Samuel Rocha', text: 'A pose ficou ótima e super divertida.', rating: 5 },
                { name: 'Lara Oliveira', text: 'Uma das personagens mais bonitas.', rating: 5 }
            ]
        }
    ];

    let products = fallbackProducts;
    let lastCardTrigger = null;

    window.brinkaCatalog = Object.freeze({
        getProducts() {
            return products.map(product => ({ ...product }));
        }
    });

    function createStars(rating) {
        const filledStars = Math.round(rating);
        return `${'★'.repeat(filledStars)}${'☆'.repeat(5 - filledStars)}`;
    }

    function trapFocus(container, event) {
        if (event.key !== 'Tab') return;

        const focusable = Array.from(container.querySelectorAll(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        )).filter(element => element.getClientRects().length > 0);

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

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

            window.location.href = 'pages/pagamento.html'
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
    }

    function renderizarCards(section, activeFilters = ['all']) {
        const grid = section.querySelector('.catalog-card-grid');
        if (!grid) return;

        const visibleProducts = activeFilters.includes('all')
            ? products
            : products.filter(product => activeFilters.includes(product.category));

        const cards = visibleProducts.map(product => {
            const item = document.createElement('li');
            const card = document.createElement('character-card');

            card.setAttribute('product-id', product.id);
            card.setAttribute('name', product.name);
            card.setAttribute('color-from', product.colorFrom);
            card.setAttribute('color-to', product.colorTo);
            card.setAttribute('img', product.image);
            card.setAttribute('desc', product.description);
            card.setAttribute('price', String(product.price));

            item.append(card);
            return item;
        });

        grid.replaceChildren(...cards);
    }

    function createCommentElement(comment) {
        const commentElement = document.createElement('article');
        const avatar = document.createElement('span');
        const content = document.createElement('div');
        const name = document.createElement('strong');
        const text = document.createElement('p');
        const stars = document.createElement('span');

        commentElement.className = 'product-comment';
        avatar.className = 'product-comment-avatar';
        content.className = 'product-comment-content';
        stars.className = 'product-comment-stars';

        avatar.textContent = comment.name.split(' ').map(word => word[0]).slice(0, 2).join('');
        name.textContent = comment.name;
        text.textContent = comment.text;
        stars.textContent = createStars(comment.rating);
        stars.setAttribute('aria-label', `${comment.rating} de 5 estrelas`);

        content.append(name, text);
        commentElement.append(avatar, content, stars);
        return commentElement;
    }

    async function preencherModal(product, modal) {
        modal.title.textContent = product.name;
        modal.image.src = product.image;
        modal.image.alt = `Avatar de ${product.name}`;
        modal.visual.style.background = `linear-gradient(160deg, ${product.colorFrom}, ${product.colorTo})`;
        modal.description.textContent = product.description;
        modal.price.textContent = moneyFormatter.format(product.price);
        modal.comments.textContent = 'Carregando avaliações...';
        modal.currentProductId = product.id;

        const reviews = await window.brinkaCatalogApi.listReviews(product.id, product.comments);
        if (modal.currentProductId !== product.id) return;

        const averageRating = window.brinkaCatalogApi.calculateAverage(reviews, product.averageRating);
        const formattedAverage = averageRating.toFixed(1).replace('.', ',');

        modal.average.textContent = formattedAverage;
        modal.stars.textContent = createStars(averageRating);
        modal.stars.setAttribute('aria-label', `Média de ${formattedAverage} de 5 estrelas`);

        if (reviews.length) {
            modal.comments.replaceChildren(...reviews.map(createCommentElement));
        } else {
            modal.comments.textContent = 'Ainda não há avaliações para este personagem.';
        }
    }

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
