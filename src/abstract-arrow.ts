import { ReactiveElement, PropertyValues } from '@lit/reactive-element';
import { property } from '@lit/reactive-element/decorators.js';
import vizObserver, { Rect } from 'viz-observer';

export type { Rect };

export class AbstractArrow extends ReactiveElement {
  static tagName = 'abstract-arrow';

  static register() {
    customElements.define(this.tagName, this);
  }

  /** A CSS selector for the source of the arrow. */
  @property({ type: String, reflect: true }) source: string = '';
  #sourceCleanup: (() => void) | null = null;
  #sourceElement: Element | null = null;
  #sourceRect!: Rect;

  /** A CSS selector for the target of the arrow. */
  @property({ type: String, reflect: true }) target: string = '';
  #targetCleanup: (() => void) | null = null;
  #targetElement: Element | null = null;
  #targetRect!: Rect;

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unobserveSource();
    this.#unobserveTarget();
  }

  #observerSource() {
    this.#unobserveSource();
    this.#sourceElement = document.querySelector(this.source);

    if (!this.#sourceElement) {
      throw new Error('source is not a valid element');
    }
    return vizObserver(this.#sourceElement, (rect) => {
      this.#sourceRect = rect;
      this.requestUpdate();
    });
  }

  #unobserveSource() {
    this.#sourceCleanup?.();
    this.#sourceCleanup = null;
  }

  #observeTarget() {
    this.#unobserveTarget();
    this.#targetElement = document.querySelector(this.target);

    if (!this.#targetElement) {
      throw new Error('target is not a valid element');
    }
    return vizObserver(this.#targetElement, (rect) => {
      this.#targetRect = rect;
      this.requestUpdate();
    });
  }

  #unobserveTarget() {
    this.#targetCleanup?.();
    this.#targetCleanup = null;
  }

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);

    if (!this.source || !this.target) {
      return;
    }

    if (changedProperties.has('source')) {
      this.#sourceCleanup = this.#observerSource();
    }

    if (changedProperties.has('target')) {
      this.#targetCleanup = this.#observeTarget();
    }

    this.render(this.#sourceRect, this.#targetRect, this.#sourceElement!, this.#targetElement!);
  }

  // @ts-ignore
  render(sourceRect: Rect, targetRect: Rect, sourceElement: Element, targetElement: Element) {}
}
