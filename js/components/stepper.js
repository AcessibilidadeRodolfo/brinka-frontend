/**
 * js/components/stepper.js
 * Controlador genérico de formulários em múltiplas etapas ("wizard").
 * Não conhece regras de negócio de nenhuma página específica — recebe os
 * elementos das etapas e do indicador de progresso e apenas orquestra
 * visibilidade, atributos de acessibilidade e foco.
 *
 * Reutilizável em qualquer fluxo futuro com mais de uma etapa.
 */
export class Stepper {
  /**
   * @param {Object} options
   * @param {HTMLElement[]} options.steps - elementos de cada etapa (na ordem).
   * @param {HTMLElement[]} options.indicators - itens visuais do indicador de progresso.
   * @param {HTMLElement} [options.liveRegion] - região aria-live para anunciar a troca de etapa.
   * @param {(current: number, total: number) => string} [options.announce] - texto do anúncio.
   */
  constructor({ steps, indicators, liveRegion, announce }) {
    this.steps = steps;
    this.indicators = indicators;
    this.liveRegion = liveRegion;
    this.announce =
      announce || ((current, total) => `Etapa ${current} de ${total}.`);
    this.current = 0;
    this._render(false);
  }

  get total() {
    return this.steps.length;
  }

  get isFirst() {
    return this.current === 0;
  }

  get isLast() {
    return this.current === this.total - 1;
  }

  goNext() {
    if (this.isLast) return;
    this.current += 1;
    this._render(true);
  }

  goBack() {
    if (this.isFirst) return;
    this.current -= 1;
    this._render(true);
  }

  _render(moveFocus) {
    this.steps.forEach((step, index) => {
      const active = index === this.current;
      step.hidden = !active;
      step.setAttribute("aria-hidden", String(!active));
    });

    this.indicators.forEach((indicator, index) => {
      let state = "upcoming";
      if (index < this.current) state = "complete";
      else if (index === this.current) state = "active";
      indicator.dataset.state = state;
    });

    if (this.liveRegion) {
      this.liveRegion.textContent = this.announce(this.current + 1, this.total);
    }

    if (moveFocus) {
      const focusTarget = this.steps[this.current].querySelector(
        "input, select, textarea, button"
      );
      focusTarget?.focus();
    }
  }
}
