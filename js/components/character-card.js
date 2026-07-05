/* ====================================================================
character-card.js
- Define o Web Component <character-card>.
- Componente "burro": não sabe nada sobre a página onde é usado
    (não conhece .personagens-section, tabs, filtros, etc).
- Só sabe se auto-renderizar a partir dos próprios atributos
    (name, color-from, color-to, desc, favorited) e emitir a
    interação de favoritar via live region mais próxima.
==================================================================== */

(function () {

    class CharacterCard extends HTMLElement {
        connectedCallback() {
            const name = this.getAttribute('name') || '';
            const from = this.getAttribute('color-from') || '#444';
            const to = this.getAttribute('color-to') || '#222';
            const desc = this.getAttribute('desc') || '';
            const favorited = this.hasAttribute('favorited');

            this.style.background = '';

            this.innerHTML = `
            <article class="character-card" style="background: linear-gradient(160deg, ${from}, ${to});">
                <div class="ps-card-top">
                <h3>${name}</h3>
                <button
                    type="button"
                    class="ps-fav-button"
                    aria-pressed="${favorited}"
                    aria-label="${favorited ? `Remover ${name} dos favoritos` : `Adicionar ${name} aos favoritos`}"
                >${favorited ? '✓' : '+'}</button>
                </div>
                <img
                src="https://placehold.co/200x260/transparent/ffffff?text=%20"
                alt="Avatar de ${name}: ${desc}"
                >
            </article>
            `;

            this.querySelector('.ps-fav-button').addEventListener('click', (e) => {
                const pressed = e.currentTarget.getAttribute('aria-pressed') === 'true';
                this.toggleAttribute('favorited', !pressed);

                // Anuncia via a live region mais próxima (dentro da mesma section),
                // em vez de um id fixo na página inteira. O componente não conhece
                // a página, só sobe até achar QUALQUER live region ancestral.
                const section = this.closest('.personagens-section');
                const live = section ? section.querySelector('.ps-live-region') : null;
                if (live) {
                    live.textContent = !pressed
                    ? `${name} adicionado aos favoritos`
                    : `${name} removido dos favoritos`;
                }

                this.connectedCallback(); // re-render simples
                this.querySelector('.ps-fav-button').focus();
            });
        }
    }

    if (!customElements.get('character-card')) {
        customElements.define('character-card', CharacterCard);
    }

})();