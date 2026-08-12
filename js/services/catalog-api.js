(function () {
    const storagePrefix = 'brinka:reviews:';

    /** Converte "Clássicos Especiais" em "classicos-especiais". */
    function slugify(text) {
        return String(text || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    /** Gera um gradiente determinístico (mesmo produto = mesmas cores sempre). */
    function colorsFromSeed(seed) {
        const palette = [
            ['#DF7A96', '#F6356B'], ['#26AACE', '#287488'], ['#A9852C', '#D4B13A'],
            ['#ADBF35', '#676F2C'], ['#AA4B19', '#FF823F'], ['#864ECE', '#4C2085'],
            ['#AA1919', '#DC6767'], ['#0C9A93', '#0C7A75']
        ];
        let hash = 0;
        const str = String(seed);
        for (let i = 0; i < str.length; i += 1) {
            hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
        }
        return palette[hash % palette.length];
    }

    function normalizeReview(review) {
        return {
            name: review.usuario ?? review.name ?? 'Cliente Brinka',
            text: review.comentario ?? review.text ?? '',
            rating: Number(review.nota ?? review.rating ?? 0)
        };
    }

    /** Converte um produto no formato da brinka-api para o formato usado pelas telas. */
    function normalizeProduct(raw) {
        const id = String(raw.id);
        const [colorFrom, colorTo] = colorsFromSeed(id);
        const comments = Array.isArray(raw.avaliacoes) ? raw.avaliacoes.map(normalizeReview) : [];

        return {
            id,
            name: raw.nome,
            category: slugify(raw.categoria),
            image: raw.imagem,
            description: raw.descricao,
            price: Number(raw.preco),
            estoque: raw.estoque,
            comments,
            averageRating: calculateAverage(comments, 0),
            colorFrom,
            colorTo
        };
    }

    function getApiUrl() {
        return (window.BRINKA_API_URL || '').replace(/\/$/, '');
    }

    async function request(path, options = {}) {
        const apiUrl = getApiUrl();
        if (!apiUrl) return null;

        try {
            const response = await fetch(`${apiUrl}${path}`, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });

            if (!response.ok) {
                throw new Error(`A API respondeu com o status ${response.status}`);
            }

            return response.status === 204 ? null : response.json();
        } catch (error) {
            console.warn('A API do catálogo não respondeu. Usando os dados locais.', error);
            return null;
        }
    }

    function getStoredReviews(productId) {
        try {
            const stored = localStorage.getItem(`${storagePrefix}${productId}`);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }

    function saveStoredReviews(productId, reviews) {
        try {
            localStorage.setItem(`${storagePrefix}${productId}`, JSON.stringify(reviews));
        } catch {
            // O site continua funcionando se o navegador bloquear o localStorage.
        }
    }

    async function listProducts(fallbackProducts) {
        const remoteProducts = await request('/products');
        if (!Array.isArray(remoteProducts)) return fallbackProducts;

        return remoteProducts.map(normalizeProduct);
    }

    async function listReviews(productId, fallbackReviews = []) {
        const product = await request(`/products/${encodeURIComponent(productId)}?avaliacoes=true`);
        if (product && Array.isArray(product.avaliacoes)) return product.avaliacoes.map(normalizeReview);

        return getStoredReviews(productId) || fallbackReviews;
    }

    async function createReview(productId, review, fallbackReviews = []) {
        const normalizedReview = {
            text: String(review.text || '').trim(),
            rating: Number(review.rating),
            name: String(review.name || '').trim()
        };

        if (!normalizedReview.text) {
            throw new Error('O comentário é obrigatório.');
        }

        if (!Number.isInteger(normalizedReview.rating) || normalizedReview.rating < 1 || normalizedReview.rating > 5) {
            throw new Error('A avaliação deve estar entre 1 e 5 estrelas.');
        }

        if (!normalizedReview.name) {
            throw new Error('Informe seu nome para avaliar.');
        }

        // Não existe endpoint de criação de avaliação na brinka-api — toda
        // avaliação nova fica só local (localStorage) por enquanto.

        const reviews = [...(getStoredReviews(productId) || fallbackReviews), normalizedReview];
        saveStoredReviews(productId, reviews);
        return normalizedReview;
    }

    function calculateAverage(reviews, fallbackAverage = 0) {
        if (!reviews.length) return fallbackAverage;

        const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
        return total / reviews.length;
    }

    window.brinkaCatalogApi = Object.freeze({
        listProducts,
        listReviews,
        createReview,
        calculateAverage
    });
})();
