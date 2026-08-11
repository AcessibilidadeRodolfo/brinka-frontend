/* ====================================================================
character-card.js
- Define o Web Component <character-card>.
- Componente "burro": não sabe nada sobre a página onde é usado
    (não conhece .personagens-section, tabs, filtros, etc).
- Só sabe se auto-renderizar a partir dos próprios atributos
    (name, color-from, color-to, desc, img e price) e emitir
    eventos de interação para outros componentes da página.
==================================================================== */

(function () {
    const moneyFormatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    class CharacterCard extends HTMLElement {
        connectedCallback() {
            const name = this.getAttribute('name') || '';
            const from = this.getAttribute('color-from') || '#444';
            const to = this.getAttribute('color-to') || '#222';
            const desc = this.getAttribute('desc') || '';
            const img = this.getAttribute('img') || 'https://placehold.co/200x260/transparent/ffffff?text=%20';
            const parsedPrice = Number(this.getAttribute('price'));
            const price = Number.isFinite(parsedPrice) ? parsedPrice : 69.99;
            const productId = this.getAttribute('product-id') || '';

            this.style.background = '';

            this.innerHTML = `
            <article class="character-card" style="background: linear-gradient(160deg, ${from}, ${to});">
                <button
                    type="button"
                    class="character-card-open"
                    aria-label="Ver detalhes de ${name}"
                ></button>
                <div class="ps-card-top">
                <h3>${name}</h3>
                <button
                    type="button"
                    class="ps-fav-button ps-cart-add-button"
                    aria-label="Adicionar ${name} ao carrinho"
                >+</button>
                </div>
                <div class="ps-card-bottom">
                    <span>${moneyFormatter.format(price)}</span>
                </div>
                <img
                src="${img}"
                alt="Avatar de ${name}: ${desc}"
                >
            </article>
            `;

            this.querySelector('.character-card-open').addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('character:open-details', {
                    bubbles: true,
                    detail: {
                        productId,
                        trigger: this.querySelector('.character-card-open')
                    }
                }));
            });

            this.querySelector('.ps-fav-button').addEventListener('click', (e) => {
                e.stopPropagation();
                const addButton = e.currentTarget;

                this.dispatchEvent(new CustomEvent('cart:add', {
                    bubbles: true,
                    detail: {
                        product: {
                            id: productId,
                            name,
                            image: img,
                            price,
                            color: from
                        }
                    }
                }));

                window.clearTimeout(this.cartFeedbackTimer);
                addButton.classList.remove('is-added');
                void addButton.offsetWidth;
                addButton.textContent = '✓';
                addButton.classList.add('is-added');

                this.cartFeedbackTimer = window.setTimeout(() => {
                    if (!addButton.isConnected) return;

                    addButton.classList.remove('is-added');
                    addButton.textContent = '+';
                    addButton.setAttribute('aria-label', `Adicionar ${name} ao carrinho`);
                }, 900);

                const section = this.closest('.personagens-section');
                const live = section ? section.querySelector('.ps-live-region') : null;
                if (live) {
                    live.textContent = `${name} adicionado ao carrinho`;
                }
            });
        }
    }

    if (!customElements.get('character-card')) {
        customElements.define('character-card', CharacterCard);
    }

})();
