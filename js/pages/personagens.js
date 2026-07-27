/* ====================================================================
personagens.js
- Lógica específica da .personagens-section (não é reutilizável
    em outras páginas, ao contrário do <character-card>).
- Inicializa as tabs (filtros) ESCOPADO ao elemento .personagens-section
    recebido, em vez de usar document.getElementById. Isso permite ter
    mais de uma instância dessa section na mesma página sem colisão de id.
- Depende de <character-card> já estar definido (ver character-card.js),
    mas não precisa ser carregado antes: como tudo roda em
    DOMContentLoaded, dá tempo dos dois scripts serem registrados.
==================================================================== */

(function () {

    /* ---------- Tabs: navegação por teclado (WAI-ARIA APG) ----------
    Inicializa cada instância de .personagens-section encontrada na página,
    escopando os seletores a essa instância — não a `document` inteiro. */
    function initPersonagensSection(section) {
        const tablist = section.querySelector('[role="tablist"]');
        if (!tablist) return;

        const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
        const live = section.querySelector('.ps-live-region');

        function selectTab(tab) {
            tabs.forEach(t => {
                t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
                t.tabIndex = t === tab ? 0 : -1;
            });
            tab.focus();
            // aqui entraria a lógica real de filtrar os cards dessa section
            if (live) live.textContent = `Filtro: ${tab.textContent}`;
        }

        tabs.forEach((tab, i) => {
            tab.addEventListener('click', () => selectTab(tab));
            tab.addEventListener('keydown', (e) => {
                let newIndex = null;
                if (e.key === 'ArrowRight') newIndex = (i + 1) % tabs.length;
                if (e.key === 'ArrowLeft') newIndex = (i - 1 + tabs.length) % tabs.length;
                if (e.key === 'Home') newIndex = 0;
                if (e.key === 'End') newIndex = tabs.length - 1;
                if (newIndex !== null) {
                    e.preventDefault();
                    selectTab(tabs[newIndex]);
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.personagens-section').forEach(initPersonagensSection);
    });

})();