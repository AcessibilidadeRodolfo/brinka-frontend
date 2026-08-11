document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.home-btn');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    buttons.forEach((button, index) => {
        button.classList.toggle('active', index === 0);

        button.addEventListener('click', () => {
            buttons.forEach((item) => item.classList.remove('active'));
            button.classList.add('active');

            const targetSelector = button.dataset.scrollTarget;
            const target = targetSelector ? document.querySelector(targetSelector) : null;
            target?.scrollIntoView({
                behavior: reduceMotion.matches ? 'auto' : 'smooth',
                block: 'start'
            });
        });
    });
});
