/*
 * Camada de acesso aos dados do catálogo.
 *
 * Sem uma API configurada, o site usa os dados locais e o localStorage.
 * Para conectar o backend futuramente, defina antes deste arquivo:
 * window.BRINKA_API_URL = 'https://seu-dominio.com/api';
 *
 * Contrato esperado da API:
 * GET  /products
 * GET  /products/:productId/reviews
 * POST /products/:productId/reviews  { name, text, rating }
 */
(function () {
    const storagePrefix = 'brinka:reviews:';

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
        return Array.isArray(remoteProducts) ? remoteProducts : fallbackProducts;
    }

    async function listReviews(productId, fallbackReviews = []) {
        const remoteReviews = await request(`/products/${encodeURIComponent(productId)}/reviews`);
        if (Array.isArray(remoteReviews)) return remoteReviews;

        return getStoredReviews(productId) || fallbackReviews;
    }

    async function createReview(productId, review, fallbackReviews = []) {
        const normalizedReview = {
            name: review.name.trim(),
            text: review.text.trim(),
            rating: Number(review.rating)
        };

        if (!normalizedReview.name || !normalizedReview.text) {
            throw new Error('Nome e comentário são obrigatórios.');
        }

        if (!Number.isInteger(normalizedReview.rating) || normalizedReview.rating < 1 || normalizedReview.rating > 5) {
            throw new Error('A avaliação deve estar entre 1 e 5 estrelas.');
        }

        const remoteReview = await request(`/products/${encodeURIComponent(productId)}/reviews`, {
            method: 'POST',
            body: JSON.stringify(normalizedReview)
        });

        if (remoteReview) return remoteReview;

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
