import { ReactiveElement, PropertyValues } from '@lit/reactive-element';
import { property } from '@lit/reactive-element/decorators.js';
import { getArrow, getBoxToBoxArrow, ArrowOptions } from 'perfect-arrows';
import vizObserver, { Rect } from 'viz-observer';

export type ArrowType = 'point' | 'box';

export type Arrow = [
  sx: number,
  sy: number,
  cx: number,
  cy: number,
  ex: number,
  ey: number,
  ae: number,
  as: number,
  ec: number
];

export class PerfectArrow extends ReactiveElement {
  static tagName = 'perfect-arrow';

  static register() {
    customElements.define(this.tagName, this);
  }

  @property({ type: String }) type: ArrowType = 'box';

  @property({ type: String }) source: string = '';
  #sourceCleanup: (() => void) | null = null;
  #sourceRect!: Rect;

  @property({ type: String }) target: string = '';
  #targetCleanup: (() => void) | null = null;
  #targetRect!: Rect;

  @property({ type: Number }) bow: number = 0;

  @property({ type: Number }) stretch: number = 0.25;

  @property({ type: Number, attribute: 'stretch-min' }) stretchMin: number = 50;

  @property({ type: Number, attribute: 'stretch-max' }) stretchMax: number = 420;

  @property({ type: Number, attribute: 'pad-start' }) padStart: number = 0;

  @property({ type: Number, attribute: 'pad-end' }) padEnd: number = 20;

  @property({ type: Boolean }) flip: boolean = false;

  @property({ type: Boolean }) straights: boolean = true;

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unobserveSource();
    this.unobserveTarget();
  }

  observerSource() {
    this.unobserveSource();
    const el = document.getElementById(this.source);

    if (!el) {
      throw new Error('source is not a valid element');
    }
    return vizObserver(el, (rect) => {
      this.#sourceRect = rect;
      this.requestUpdate();
    });
  }

  unobserveSource() {
    this.#sourceCleanup?.();
    this.#sourceCleanup = null;
  }

  observerTarget() {
    this.unobserveTarget();
    const el = document.getElementById(this.target);

    if (!el) {
      throw new Error('source is not a valid element');
    }
    return vizObserver(el, (rect) => {
      this.#targetRect = rect;
      this.requestUpdate();
    });
  }

  unobserveTarget() {
    this.#targetCleanup?.();
    this.#targetCleanup = null;
  }

  getArrow(sourceBox: Rect, targetBox: Rect, options: ArrowOptions): Arrow {
    switch (this.type) {
      case 'point': {
        const sourceX = sourceBox.x + sourceBox.width / 2;
        const sourceY = sourceBox.y + sourceBox.height / 2;
        const targetX = targetBox.x + targetBox.width / 2;
        const targetY = targetBox.y + targetBox.height / 2;
        return getArrow(sourceX, sourceY, targetX, targetY, options) as Arrow;
      }
      case 'box': {
        return getBoxToBoxArrow(
          sourceBox.x,
          sourceBox.y,
          sourceBox.width,
          sourceBox.height,
          targetBox.x,
          targetBox.y,
          targetBox.width,
          targetBox.height,
          options
        ) as Arrow;
      }
    }
  }

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);

    if (changedProperties.has('source')) {
      this.#sourceCleanup = this.observerSource();
    }

    if (changedProperties.has('target')) {
      this.#targetCleanup = this.observerTarget();
    }

    const options: ArrowOptions = {
      bow: this.bow,
      stretch: this.stretch,
      stretchMin: this.stretchMin,
      stretchMax: this.stretchMax,
      padStart: this.padStart,
      padEnd: this.padEnd,
      flip: this.flip,
      straights: this.straights,
    };

    const arrow = this.getArrow(this.#sourceRect, this.#targetRect, options);

    this.render(arrow);
  }

  render([sx, sy, cx, cy, ex, ey, ae]: Arrow) {
    const endAngleAsDegrees = ae * (180 / Math.PI);

    const { width, height } = this.getBoundingClientRect();

    if (!this.shadowRoot) return;

    // TODO: optimize lol
    this.shadowRoot.innerHTML = `
      <svg
        viewBox="0 0 ${width} ${height}"
        style=" width: ${width}px; height: ${height}px;"
        stroke="#000"
        fill="#000"
        strokeWidth="3"
      >
        <circle cx="${sx}" cy="${sy}" r="4" />
        <path d="${`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`}" fill="none" />
        <polygon
          points="0,-6 12,0, 0,6"
          transform="${`translate(${ex},${ey}) rotate(${endAngleAsDegrees})`}"
        />
      </svg>`;
  }
}
