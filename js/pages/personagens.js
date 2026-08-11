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

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
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

    function abrirModal(product, trigger, modal, source = 'catalog') {
        if (!product || !modal.overlay) return;

        lastCardTrigger = trigger;
        modal.backgroundCartDrawer = source === 'cart'
            ? document.querySelector('.cart-overlay.is-open .cart-drawer')
            : null;
        void preencherModal(product, modal);
        modal.overlay.removeAttribute('inert');
        modal.overlay.classList.toggle('is-open-from-cart', source === 'cart');
        modal.overlay.classList.add('is-open');
        modal.overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            if (!modal.overlay.classList.contains('is-open')) return;

            modal.close.focus();
            modal.backgroundCartDrawer?.setAttribute('inert', '');
            modal.backgroundCartDrawer?.setAttribute('aria-hidden', 'true');
        });
    }

    function fecharModal(modal) {
        if (!modal.overlay?.classList.contains('is-open')) return;

        modal.overlay.classList.remove('is-open');
        modal.overlay.classList.remove('is-open-from-cart');
        document.body.style.overflow = '';

        const fallbackTrigger = Array.from(document.querySelectorAll('.cart-item-open')).find(button => {
            return button.dataset.productId === modal.currentProductId;
        });
        const focusTarget = lastCardTrigger?.isConnected ? lastCardTrigger : fallbackTrigger;

        modal.backgroundCartDrawer?.removeAttribute('inert');
        modal.backgroundCartDrawer?.removeAttribute('aria-hidden');
        modal.backgroundCartDrawer = null;
        focusTarget?.focus();
        modal.overlay.setAttribute('aria-hidden', 'true');
        modal.overlay.setAttribute('inert', '');
        lastCardTrigger = null;
    }

    function initProductModal(section) {
        const overlay = document.querySelector('.product-details-overlay');
        const modal = {
            overlay,
            dialog: overlay?.querySelector('.product-details-modal'),
            close: overlay?.querySelector('.product-details-close'),
            visual: overlay?.querySelector('.product-details-visual'),
            image: overlay?.querySelector('.product-details-image'),
            title: overlay?.querySelector('#product-details-title'),
            description: overlay?.querySelector('.product-details-description'),
            average: overlay?.querySelector('.product-details-average'),
            stars: overlay?.querySelector('.product-details-stars'),
            comments: overlay?.querySelector('.product-details-comments-list'),
            price: overlay?.querySelector('.product-details-price strong')
        };

        if (!modal.overlay || !modal.close || !modal.dialog) return;

        document.addEventListener('character:open-details', event => {
            const product = products.find(item => item.id === event.detail?.productId);
            abrirModal(product, event.detail?.trigger || event.target, modal, event.detail?.source);
        });

        modal.close.addEventListener('click', () => fecharModal(modal));
        modal.dialog.addEventListener('keydown', event => trapFocus(modal.dialog, event));

        modal.overlay.addEventListener('click', event => {
            if (event.target === modal.overlay) {
                fecharModal(modal);
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                fecharModal(modal);
            }
        });
    }

    async function initPersonagensSection(section) {
        const filterGroup = section.querySelector('.catalog-tabs');
        const filterOptions = Array.from(filterGroup?.querySelectorAll('.catalog-filter-option') || []);
        const live = section.querySelector('.ps-live-region');
        const filterToggle = section.querySelector('.catalog-filter-toggle');
        const filterModal = section.querySelector('.catalog-filter-modal');
        const filterDialog = section.querySelector('.catalog-filter-dialog');
        const filterBackdrop = section.querySelector('.catalog-filter-backdrop');
        const filterClose = section.querySelector('.catalog-filter-close');
        const mobileFilterQuery = window.matchMedia('(max-width: 47.99rem)');

        function setFilterMenuState(isOpen, shouldReturnFocus = false) {
            if (!filterToggle || !filterModal || !filterDialog) return;

            filterModal.classList.toggle('is-open', isOpen);
            filterToggle.setAttribute('aria-expanded', String(isOpen));
            document.body.classList.toggle('has-open-filter-modal', isOpen);

            if (isOpen) {
                filterDialog.setAttribute('role', 'dialog');
                filterDialog.setAttribute('aria-modal', 'true');
                const selectedOption = filterOptions.find(option => option.getAttribute('aria-pressed') === 'true') || filterOptions[0];
                selectedOption?.focus();
            } else {
                filterDialog.removeAttribute('role');
                filterDialog.removeAttribute('aria-modal');

                if (shouldReturnFocus) {
                    filterToggle.focus();
                }
            }
        }

        function updateFilterState(option) {
            const allOption = filterOptions.find(item => item.dataset.filter === 'all');

            if (option.dataset.filter === 'all') {
                filterOptions.forEach(item => item.setAttribute('aria-pressed', String(item === allOption)));
            } else {
                const isPressed = option.getAttribute('aria-pressed') === 'true';
                option.setAttribute('aria-pressed', String(!isPressed));

                const hasSpecificFilter = filterOptions.some(item =>
                    item.dataset.filter !== 'all' && item.getAttribute('aria-pressed') === 'true'
                );

                allOption?.setAttribute('aria-pressed', String(!hasSpecificFilter));
            }

            const activeOptions = filterOptions.filter(item => item.getAttribute('aria-pressed') === 'true');
            const activeFilters = activeOptions.map(item => item.dataset.filter);
            renderizarCards(section, activeFilters);

            if (live) {
                live.textContent = activeFilters.includes('all')
                    ? 'Todos os personagens estão selecionados'
                    : `Filtros ativos: ${activeOptions.map(item => item.textContent.trim()).join(', ')}`;
            }

            if (mobileFilterQuery.matches) {
                setFilterMenuState(false, true);
            }
        }

        products = await window.brinkaCatalogApi.listProducts(fallbackProducts);
        renderizarCards(section);
        initProductModal(section);

        filterToggle?.addEventListener('click', () => setFilterMenuState(true));
        filterBackdrop?.addEventListener('click', () => setFilterMenuState(false, true));
        filterClose?.addEventListener('click', () => setFilterMenuState(false, true));
        filterModal?.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                setFilterMenuState(false, true);
            } else if (filterModal.classList.contains('is-open')) {
                trapFocus(filterDialog, event);
            }
        });
        mobileFilterQuery.addEventListener('change', event => {
            if (!event.matches) {
                setFilterMenuState(false);
            }
        });
        filterOptions.forEach(option => option.addEventListener('click', () => updateFilterState(option)));
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.personagens-section').forEach(section => {
            void initPersonagensSection(section);
        });
    });
})();
