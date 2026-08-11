(function () {
    const products = [
        {
            id: 'mari-marrao',
            name: 'Mari Marrão',
            category: 'classicos',
            colorFrom: '#DF7A96',
            colorTo: '#F6356B',
            image: 'assets/images/mari-marrao.png',
            description: 'Boina branca, cabelo cacheado castanho e jardineira jeans.',
            price: 69.99
        },
        {
            id: 'erick-santos',
            name: 'Erick Santos',
            category: 'classicos',
            colorFrom: '#26AACE',
            colorTo: '#287488',
            image: 'assets/images/erick-santos.png',
            description: 'Moletom cinza com detalhes verdes e fazendo sinal de paz.',
            price: 69.99
        },
        {
            id: 'rahquel-emido',
            name: 'Rahquel Emido',
            category: 'especiais',
            colorFrom: '#A9852C',
            colorTo: '#D4B13A',
            image: 'assets/images/rahquel-korzh.png',
            description: 'Óculos redondos, blusa listrada e cabelo longo escuro.',
            price: 69.99
        },
        {
            id: 'joao-souza',
            name: 'João Souza',
            category: 'classicos',
            colorFrom: '#ADBF35',
            colorTo: '#676F2C',
            image: 'assets/images/joao-souza.png',
            description: 'Moletom cinza escrito New York e cabelo cacheado.',
            price: 69.99
        },
        {
            id: 'vinicius-boas',
            name: 'Vinícius Boas',
            category: 'novos',
            colorFrom: '#AA4B19',
            colorTo: '#FF823F',
            image: 'assets/images/vini-vilas.png',
            description: 'Óculos, moletom preto e copo de café na mão.',
            price: 69.99
        },
        {
            id: 'isepe-nic',
            name: 'Isepe Nic',
            category: 'especiais',
            colorFrom: '#864ECE',
            colorTo: '#4C2085',
            image: 'assets/images/isepe.png',
            description: 'Óculos, camiseta amarela estampada e cabelo castanho.',
            price: 69.99
        },
        {
            id: 'samuel',
            name: 'Samuel',
            category: 'promocoes',
            colorFrom: '#AA1919',
            colorTo: '#DC6767',
            image: 'assets/images/samuca.png',
            description: 'Visual marcante e descontraído para completar a coleção.',
            price: 69.99
        },
        {
            id: 'nanda',
            name: 'Nanda Nagata',
            category: 'novos',
            colorFrom: '#0C9A93',
            colorTo: '#0C7A75',
            image: 'assets/images/nanda.png',
            description: 'Cheia de alto-astral e confiança para deixar a coleção colorida.',
            price: 69.99
        }
    ];

    function normalizeText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function getCategoryFromTab(tab) {
        const categoryByName = {
            todos: 'all',
            classicos: 'classicos',
            especiais: 'especiais',
            novos: 'novos',
            promocoes: 'promocoes'
        };

        return categoryByName[normalizeText(tab.textContent)] || 'all';
    }

    function renderCards(section, activeCategory = 'all') {
        const grid = section.querySelector('.catalog-card-grid');
        if (!grid) return;

        const visibleProducts = activeCategory === 'all'
            ? products
            : products.filter(product => product.category === activeCategory);

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

    function initPersonagensSection(section) {
const tabs = Array.from(section.querySelectorAll('.catalog-tabs button'));        const live = section.querySelector('.ps-live-region');

        let activeCategory = 'all';
        renderCards(section, activeCategory);

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                activeCategory = getCategoryFromTab(tab);

                tabs.forEach(item => {
                    item.setAttribute('aria-pressed', String(item === tab));
                });

                renderCards(section, activeCategory);

                if (live) {
                    live.textContent = activeCategory === 'all'
                        ? 'Todos os personagens estão sendo exibidos'
                        : `Filtro ${tab.textContent.trim()} aplicado`;
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.personagens-section').forEach(initPersonagensSection);
    });
})();