(function () {
    function initPersonagensSection(section) {
        const filters = Array.from(
            section.querySelectorAll('.catalog-tabs button')
        );
        const live = section.querySelector('.ps-live-region');

        function setFilter(button) {
            const isAllFilter = button.textContent.trim() === 'Todos';
            const willBeActive = button.getAttribute('aria-pressed') !== 'true';

            if (isAllFilter) {
                filters.forEach((filter) => {
                    filter.setAttribute('aria-pressed', 'false');
                });

                button.setAttribute('aria-pressed', String(willBeActive));
            } else {
                const allFilter = filters.find(
                    (filter) => filter.textContent.trim() === 'Todos'
                );

                if (allFilter) {
                    allFilter.setAttribute('aria-pressed', 'false');
                }

                button.setAttribute('aria-pressed', String(willBeActive));
            }

            if (live) {
                const action = willBeActive ? 'ativado' : 'desativado';
                live.textContent = `Filtro "${button.textContent.trim()}" ${action}`;
            }
        }

        filters.forEach((filter) => {
            filter.addEventListener('click', () => setFilter(filter));
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        document
            .querySelectorAll('.personagens-section')
            .forEach(initPersonagensSection);
    });
})();