import { ReactiveElement, css, PropertyValues } from '@lit/reactive-element';
import { property } from '@lit/reactive-element/decorators.js';
import { getArrow, getBoxToBoxArrow } from 'perfect-arrows';

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

  @property({ type: String }) target: string | null = null;

  @property({ type: String }) source: string | null = null;

  #targetElement!: Element;

  #sourceElement!: Element;

  get canRenderArrow() {
    return this.target == null && this.source == null;
  }

  observer = new ResizeObserver((entries) => {
    console.log(entries);
  });

  connectedCallback() {
    super.connectedCallback();
    this.#sourceElement = this.observeElement(this.source);
    this.#targetElement = this.observeElement(this.target);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer.disconnect();
  }

  observeElement(id: string | null): Element {
    if (id == null) throw new Error('id does not exist.');

    const el = document.getElementById(id);

    if (el == null) {
      throw new Error(`Id '${id}' is not an element.`);
    }

    // TODO observer mutations to location
    this.observer.observe(el);

    return el;
  }

  getArrow(targetBox: DOMRect, sourceBox: DOMRect): Arrow {
    switch (this.type) {
      case 'point': {
        return getArrow(0, 0, 0, 0) as Arrow;
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
          targetBox.height
        ) as Arrow;
      }
    }
  }

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);

    const targetBox = this.#targetElement?.getBoundingClientRect();
    const sourceBox = this.#sourceElement?.getBoundingClientRect();

    const arrow = this.getArrow(targetBox, sourceBox);

    this.render(arrow);
  }

  render([sx, sy, cx, cy, ex, ey, ae, as, ec]: Arrow) {
    const endAngleAsDegrees = ae * (180 / Math.PI);

    const { width, height } = this.getBoundingClientRect();

    if (!this.shadowRoot) return;

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
