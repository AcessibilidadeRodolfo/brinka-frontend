document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.home-btn');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            buttons.forEach((item) => {
                item.classList.remove('active');
                item.setAttribute('aria-pressed', 'false');
            });

            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');
        });
    });
});