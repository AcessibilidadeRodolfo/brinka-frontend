/* ====================================================================
voice-navigation.js

Este módulo é independente do restante da interface. Ele:
1. liga e desliga o reconhecimento de voz;
2. transforma a fala em um texto simples;
3. identifica a intenção e o personagem mencionado;
4. chama as APIs públicas do catálogo e do carrinho;
5. apresenta e fala uma confirmação para o usuário.

Para remover o teste, basta retirar este script, seu CSS e o bloco
.voice-navigation do index.html.
==================================================================== */

(function () {
    'use strict';

    /* ----------------------------------------------------------------
    1. Configuração e compatibilidade
    O prefixo webkit ainda é necessário em alguns navegadores.
    ---------------------------------------------------------------- */
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const moneyFormatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    const config = Object.freeze({
        language: 'pt-BR',
        duplicateCommandWindow: 1800,
        confirmationTimeout: 10000,
        restartDelay: 350
    });

    /* Apelidos ajudam quando o navegador escreve um nome de outra forma. */
    const productAliases = Object.freeze({
        mari: 'mari-marrao',
        'mari marrao': 'mari-marrao',
        eric: 'erick-santos',
        erick: 'erick-santos',
        'erick santos': 'erick-santos',
        raquel: 'rahquel-emido',
        rahquel: 'rahquel-emido',
        'rahquel emido': 'rahquel-emido',
        joao: 'joao-souza',
        'joao souza': 'joao-souza',
        vini: 'vinicius-boas',
        vinicius: 'vinicius-boas',
        'vinicius boas': 'vinicius-boas',
        isepe: 'isepe-nic',
        'isepe nic': 'isepe-nic',
        samuca: 'samuel',
        samuel: 'samuel',
        nanda: 'nanda',
        'nanda nagata': 'nanda'
    });

    /* ----------------------------------------------------------------
    2. Normalização do texto
    "Érick, no carrinho!" vira "erick no carrinho". Isso deixa as
    comparações previsíveis sem precisar usar inteligência artificial.
    ---------------------------------------------------------------- */
    function normalizeText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function cleanProductName(value) {
        let result = normalizeText(value)
            .replace(/\s+(?:no|ao|para o) carrinho$/, '')
            .replace(/\s+(?:do|da) carrinho$/, '')
            .trim();

        const removablePrefixes = /^(?:o|a|os|as|do|da|de|boneco|boneca|personagem|produto)\s+/;
        while (removablePrefixes.test(result)) {
            result = result.replace(removablePrefixes, '').trim();
        }

        return result;
    }

    /* ----------------------------------------------------------------
    3. Consulta ao catálogo
    O módulo não copia os produtos. Ele lê a lista oficial exposta por
    personagens.js e gera um objeto no formato aceito pelo carrinho.
    ---------------------------------------------------------------- */
    function getProducts() {
        const catalogProducts = window.brinkaCatalog?.getProducts?.();
        if (Array.isArray(catalogProducts)) return catalogProducts;

        return Array.from(document.querySelectorAll('character-card')).map(card => ({
            id: card.getAttribute('product-id'),
            name: card.getAttribute('name'),
            image: card.getAttribute('img'),
            colorFrom: card.getAttribute('color-from'),
            price: Number(card.getAttribute('price'))
        }));
    }

    function findProduct(spokenName) {
        const query = cleanProductName(spokenName);
        const products = getProducts();
        if (!query || !products.length) return null;

        const aliasProductId = productAliases[query];
        if (aliasProductId) {
            const aliasProduct = products.find(product => product.id === aliasProductId);
            if (aliasProduct) return aliasProduct;
        }

        let bestMatch = null;
        let bestScore = 0;

        products.forEach(product => {
            const normalizedName = normalizeText(product.name);
            const normalizedId = normalizeText(String(product.id || '').replace(/-/g, ' '));
            const firstName = normalizedName.split(' ')[0];
            let score = 0;

            if (query === normalizedName || query === normalizedId) score = 100;
            else if (query === firstName) score = 95;
            else if (normalizedName.startsWith(query)) score = 90;
            else if (normalizedName.includes(query)) score = 80;
            else if (query.includes(normalizedName)) score = 70;

            if (score > bestScore) {
                bestScore = score;
                bestMatch = product;
            }
        });

        return bestScore >= 70 ? bestMatch : null;
    }

    function toCartProduct(product) {
        return {
            id: product.id,
            name: product.name,
            image: product.image,
            price: Number(product.price),
            color: product.colorFrom || product.color || '#ff8fb0'
        };
    }

    /* ----------------------------------------------------------------
    4. Inicialização da interface e estado do microfone
    O reconhecimento só começa após um clique real no botão. O site não
    tenta ligar o microfone automaticamente.
    ---------------------------------------------------------------- */
    function initVoiceNavigation() {
        const root = document.querySelector('.voice-navigation');
        const toggle = root?.querySelector('.voice-toggle');
        const toggleLabel = root?.querySelector('.voice-toggle-label');
        const status = root?.querySelector('.voice-status');
        const transcript = root?.querySelector('.voice-transcript');
        const help = root?.querySelector('.voice-help');

        if (!root || !toggle || !toggleLabel || !status || !transcript) return;

        let recognition = null;
        let isEnabled = false;
        let isListening = false;
        let isSpeaking = false;
        let restartTimer = null;
        let lastCommand = '';
        let lastCommandTime = 0;
        let speechSequence = 0;
        let pendingConfirmation = null;

        function setState(state, message) {
            root.dataset.state = state;
            status.textContent = message;
        }

        function updateToggle() {
            toggle.setAttribute('aria-pressed', String(isEnabled));
            toggleLabel.textContent = isEnabled
                ? 'Desativar comandos de voz'
                : 'Ativar comandos de voz';
        }

        function showTranscript(text) {
            transcript.hidden = false;
            transcript.textContent = `Você disse: “${text}”`;
        }

        function scheduleRecognitionRestart() {
            window.clearTimeout(restartTimer);
            if (!isEnabled || isListening || isSpeaking) return;

            restartTimer = window.setTimeout(startRecognition, config.restartDelay);
        }

        /* Fala uma resposta e pausa o reconhecimento para evitar eco. */
        function speak(message) {
            if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
                setState(isEnabled ? 'listening' : 'inactive', message);
                return;
            }

            const currentSequence = ++speechSequence;
            isSpeaking = true;
            setState('speaking', message);

            if (isListening) recognition?.stop();
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = config.language;
            utterance.rate = 1;

            const finishSpeaking = () => {
                if (currentSequence !== speechSequence) return;

                isSpeaking = false;
                if (isEnabled) {
                    setState('starting', 'Preparando para ouvir o próximo comando...');
                    scheduleRecognitionRestart();
                } else {
                    setState('inactive', 'Comandos de voz desativados.');
                }
            };

            utterance.addEventListener('end', finishSpeaking, { once: true });
            utterance.addEventListener('error', finishSpeaking, { once: true });
            window.speechSynthesis.speak(utterance);
        }

        function respond(message, shouldSpeak = true) {
            if (shouldSpeak) {
                speak(message);
            } else {
                setState(isEnabled ? 'listening' : 'inactive', message);
            }
        }

        /* ----------------------------------------------------------------
        5. Pequenos comandos de interface
        Eles reutilizam botões, eventos e APIs públicas que já existem.
        ---------------------------------------------------------------- */
        function getCartSnapshot() {
            return window.brinkaCart?.getSnapshot?.() || {
                items: [],
                totalQuantity: 0,
                total: 0
            };
        }

        function getCartItem(productId) {
            return getCartSnapshot().items.find(item => item.id === productId) || null;
        }

        function openCart() {
            if (document.querySelector('.cart-overlay.is-open')) {
                respond('O carrinho já está aberto.');
                return;
            }

            document.querySelector('.btn-cart')?.click();
            respond('Carrinho aberto.');
        }

        function closeCart() {
            const closeButton = document.querySelector('.cart-overlay.is-open .cart-drawer-close');
            if (!closeButton) {
                respond('O carrinho já está fechado.');
                return;
            }

            closeButton.click();
            respond('Carrinho fechado.');
        }

        function openProductDetails(product) {
            const cartIsOpen = Boolean(document.querySelector('.cart-overlay.is-open'));
            const cartItemTrigger = Array.from(document.querySelectorAll('.cart-item-open')).find(button => {
                return button.dataset.productId === product.id;
            });
            const trigger = cartIsOpen
                ? cartItemTrigger || document.querySelector('.cart-drawer-close') || toggle
                : toggle;

            document.dispatchEvent(new CustomEvent('character:open-details', {
                detail: {
                    productId: product.id,
                    trigger,
                    source: cartIsOpen ? 'cart' : 'voice'
                }
            }));
            respond(`Detalhes de ${product.name} abertos.`);
        }

        function closeProductDetails() {
            const closeButton = document.querySelector('.product-details-overlay.is-open .product-details-close');
            if (!closeButton) {
                respond('Os detalhes já estão fechados.');
                return;
            }

            closeButton.click();
            respond('Detalhes fechados.');
        }

        function scrollToSection(selector, message) {
            const target = document.querySelector(selector);
            if (!target) {
                respond('Não encontrei essa parte da página.');
                return;
            }

            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
            respond(message);
        }

        function requestConfirmation(message, action) {
            pendingConfirmation = {
                action,
                expiresAt: Date.now() + config.confirmationTimeout
            };
            respond(`${message} Diga confirmar ou cancelar.`);
        }

        function handlePendingConfirmation(command) {
            if (!pendingConfirmation) return false;

            if (Date.now() > pendingConfirmation.expiresAt) {
                pendingConfirmation = null;
                respond('A confirmação expirou. Repita o comando.');
                return true;
            }

            if (/^(?:confirmar|confirmo|sim)(?: compra| acao)?$/.test(command)) {
                const action = pendingConfirmation.action;
                pendingConfirmation = null;
                respond(action());
                return true;
            }

            if (/^(?:cancelar|cancela|nao)$/.test(command)) {
                pendingConfirmation = null;
                respond('Ação cancelada.');
                return true;
            }

            respond('Existe uma ação aguardando confirmação. Diga confirmar ou cancelar.');
            return true;
        }

        function withProduct(spokenName, action) {
            const product = findProduct(spokenName);
            if (!product) {
                respond(`Não encontrei o personagem ${cleanProductName(spokenName)}.`);
                return;
            }

            action(product);
        }

        /* ----------------------------------------------------------------
        6. Interpretador de comandos
        A ordem é importante: primeiro verificamos confirmações e comandos
        globais; depois interpretamos frases que contêm nomes de produtos.
        ---------------------------------------------------------------- */
        function executeCommand(rawCommand) {
            const command = normalizeText(rawCommand);
            if (!command) return;

            document.dispatchEvent(new CustomEvent('voice:recognized', {
                detail: { transcript: rawCommand, command }
            }));

            if (handlePendingConfirmation(command)) return;

            if (/^(?:desativar|parar|pare)(?: os)? comandos de voz$/.test(command)) {
                stopVoiceNavigation();
                return;
            }

            if (/^(?:ajuda|mostrar ajuda|mostrar comandos|quais comandos)$/.test(command)) {
                if (help) help.open = true;
                respond('Mostrei alguns exemplos de comandos na tela.');
                return;
            }

            if (/^(?:abrir|mostrar|ver)(?: o)? carrinho$/.test(command)) {
                openCart();
                return;
            }

            if (/^(?:fechar|feche)(?: o)? carrinho$/.test(command)) {
                closeCart();
                return;
            }

            if (/^(?:fechar|feche)(?: os)? detalhes$/.test(command)) {
                closeProductDetails();
                return;
            }

            if (/^(?:limpar|esvaziar)(?: o)? carrinho$/.test(command)) {
                const snapshot = getCartSnapshot();
                if (!snapshot.totalQuantity) {
                    respond('O carrinho já está vazio.');
                    return;
                }

                requestConfirmation('Deseja remover todos os produtos do carrinho?', () => {
                    window.brinkaCart?.clear?.();
                    return 'Carrinho esvaziado.';
                });
                return;
            }

            if (/^(?:finalizar|concluir|preparar)(?: a)? compra$/.test(command)) {
                const snapshot = getCartSnapshot();
                if (!snapshot.totalQuantity) {
                    respond('O carrinho está vazio.');
                    return;
                }

                requestConfirmation(
                    `O total é ${moneyFormatter.format(snapshot.total)}. Deseja preparar a compra?`,
                    () => {
                        document.querySelector('.cart-checkout')?.click();
                        return 'Resumo da compra preparado.';
                    }
                );
                return;
            }

            if (/^(?:inicio|ir para o inicio|voltar ao inicio|ir para o topo)$/.test(command)) {
                scrollToSection('#topo', 'Voltando ao início.');
                return;
            }

            if (/^(?:ver colecao|ir para a colecao|ir para personagens|mostrar personagens)$/.test(command)) {
                scrollToSection('#personagens', 'Mostrando a coleção de personagens.');
                return;
            }

            if (/^(?:encomendar|ir para encomendar|ir para encomenda)$/.test(command)) {
                scrollToSection('#encomendar', 'Mostrando a área de encomendas.');
                return;
            }

            const filterMatch = command.match(/^(?:filtrar|filtre|mostrar)(?: por)? (todos|classicos|especiais|novos|promocoes|promocao)$/);
            if (filterMatch) {
                const filterName = filterMatch[1] === 'promocao' ? 'promocoes' : filterMatch[1];
                const filterButton = document.querySelector(`.catalog-filter-option[data-filter="${filterName === 'todos' ? 'all' : filterName}"]`);
                filterButton?.click();
                respond(`Filtro ${filterMatch[1]} aplicado.`);
                return;
            }

            const commandWithoutCartDestination = command
                .replace(/\s+(?:no|ao|para o) carrinho$/, '')
                .trim();
            const addMatch = commandWithoutCartDestination.match(
                /^(?:adicionar|adicione|colocar|coloque|incluir|inclua)\s+(?:mais\s+)?(?:(?:um|uma)\s+)?(?:(?:o|a)\s+)?(?:(?:boneco|boneca|personagem|produto)\s+)?(.+)$/
            ) || commandWithoutCartDestination.match(
                /^quero\s+(?:(?:o|a)\s+)?(?:(?:boneco|boneca|personagem|produto)\s+)?(.+)$/
            );

            if (addMatch) {
                withProduct(addMatch[1], product => {
                    window.brinkaCart?.add?.(toCartProduct(product));
                    respond(`${product.name} foi adicionado ao carrinho.`);
                });
                return;
            }

            const detailsMatch = command.match(
                /^(?:abrir|mostrar|ver)\s+(?:os\s+)?detalhes\s+(?:(?:do|da|de)\s+)?(.+)$/
            );
            if (detailsMatch) {
                withProduct(detailsMatch[1], openProductDetails);
                return;
            }

            const increaseMatch = command.match(
                /^(?:aumentar|aumente)\s+(?:(?:a|o)\s+)?(?:quantidade\s+)?(?:(?:do|da|de)\s+)?(.+)$/
            );
            if (increaseMatch) {
                withProduct(increaseMatch[1], product => {
                    if (!getCartItem(product.id)) {
                        respond(`${product.name} não está no carrinho.`);
                        return;
                    }

                    window.brinkaCart?.increase?.(product.id);
                    const quantity = getCartItem(product.id)?.quantity || 0;
                    respond(`Quantidade de ${product.name}: ${quantity}.`);
                });
                return;
            }

            const decreaseMatch = command.match(
                /^(?:diminuir|diminua)\s+(?:(?:a|o)\s+)?(?:quantidade\s+)?(?:(?:do|da|de)\s+)?(.+)$/
            );
            if (decreaseMatch) {
                withProduct(decreaseMatch[1], product => {
                    if (!getCartItem(product.id)) {
                        respond(`${product.name} não está no carrinho.`);
                        return;
                    }

                    window.brinkaCart?.decrease?.(product.id);
                    const item = getCartItem(product.id);
                    respond(item
                        ? `Quantidade de ${product.name}: ${item.quantity}.`
                        : `${product.name} foi removido do carrinho.`);
                });
                return;
            }

            const commandWithoutRemoveDestination = command
                .replace(/\s+(?:do|da) carrinho$/, '')
                .trim();
            const removeMatch = commandWithoutRemoveDestination.match(
                /^(?:remover|remova|tirar|tire)\s+(?:(?:o|a)\s+)?(?:(?:boneco|boneca|personagem|produto)\s+)?(.+)$/
            );
            if (removeMatch) {
                withProduct(removeMatch[1], product => {
                    if (!getCartItem(product.id)) {
                        respond(`${product.name} não está no carrinho.`);
                        return;
                    }

                    window.brinkaCart?.remove?.(product.id);
                    respond(`${product.name} foi removido do carrinho.`);
                });
                return;
            }

            respond('Não entendi o comando. Diga ajuda para ver alguns exemplos.');
        }

        /* ----------------------------------------------------------------
        7. Ciclo do reconhecimento de voz
        O navegador informa resultados e erros por eventos. Quando uma
        resposta falada termina, o reconhecimento é iniciado novamente.
        ---------------------------------------------------------------- */
        function startRecognition() {
            if (!recognition || !isEnabled || isListening || isSpeaking) return;

            try {
                setState('starting', 'Preparando o microfone...');
                recognition.start();
            } catch (error) {
                if (error?.name !== 'InvalidStateError') {
                    isEnabled = false;
                    updateToggle();
                    setState('error', 'Não foi possível iniciar o microfone.');
                }
            }
        }

        function startVoiceNavigation() {
            if (!recognition) return;

            isEnabled = true;
            updateToggle();
            startRecognition();
        }

        function stopVoiceNavigation() {
            isEnabled = false;
            isListening = false;
            isSpeaking = false;
            pendingConfirmation = null;
            speechSequence += 1;
            window.clearTimeout(restartTimer);
            recognition?.abort();
            window.speechSynthesis?.cancel();
            updateToggle();
            setState('inactive', 'Comandos de voz desativados.');
        }

        if (!SpeechRecognitionClass) {
            toggle.disabled = true;
            root.dataset.state = 'unsupported';
            status.textContent = 'Este navegador não oferece reconhecimento de voz interno.';
            toggleLabel.textContent = 'Comandos de voz indisponíveis';

            window.brinkaVoiceNavigation = Object.freeze({
                supported: false,
                execute: executeCommand
            });
            return;
        }

        recognition = new SpeechRecognitionClass();
        recognition.lang = config.language;
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        recognition.addEventListener('start', () => {
            isListening = true;
            setState('listening', 'Ouvindo. Diga um comando.');
        });

        recognition.addEventListener('result', event => {
            if (isSpeaking) return;

            let recognizedText = '';
            for (let index = event.resultIndex; index < event.results.length; index += 1) {
                if (event.results[index].isFinal) {
                    recognizedText = event.results[index][0].transcript.trim();
                }
            }

            if (!recognizedText) return;

            const normalizedCommand = normalizeText(recognizedText);
            const now = Date.now();
            if (
                normalizedCommand === lastCommand &&
                now - lastCommandTime < config.duplicateCommandWindow
            ) {
                return;
            }

            lastCommand = normalizedCommand;
            lastCommandTime = now;
            showTranscript(recognizedText);
            setState('processing', 'Interpretando o comando...');
            executeCommand(recognizedText);
        });

        recognition.addEventListener('error', event => {
            isListening = false;

            if (!isEnabled && event.error === 'aborted') return;

            const blockingErrors = [
                'not-allowed',
                'service-not-allowed',
                'audio-capture',
                'language-not-supported',
                'network'
            ];

            if (blockingErrors.includes(event.error)) {
                isEnabled = false;
                updateToggle();
                setState('error', event.error === 'network'
                    ? 'O serviço de voz está sem conexão. Tente novamente depois.'
                    : 'Permita o uso do microfone e tente novamente.');
                return;
            }

            if (event.error === 'no-speech') {
                setState('starting', 'Não ouvi nada. Tentando novamente...');
            } else {
                setState('error', 'O reconhecimento de voz foi interrompido.');
            }
        });

        recognition.addEventListener('end', () => {
            isListening = false;
            scheduleRecognitionRestart();
        });

        toggle.addEventListener('click', () => {
            if (isEnabled) {
                stopVoiceNavigation();
            } else {
                startVoiceNavigation();
            }
        });

        /* API pequena para testar comandos pelo console sem usar microfone. */
        window.brinkaVoiceNavigation = Object.freeze({
            supported: true,
            start: startVoiceNavigation,
            stop: stopVoiceNavigation,
            execute(command) {
                showTranscript(command);
                executeCommand(command);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', initVoiceNavigation);
})();
