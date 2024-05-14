import { ReactiveElement, PropertyValues } from '@lit/reactive-element';
import { property } from '@lit/reactive-element/decorators.js';
import { VisualObserverManager } from './visual-observer.js';
import { VisualObserverEntry } from 'viz-observer';

export class Standoff extends ReactiveElement {
  static tagName = 'stand-off';

  static register() {
    customElements.define(this.tagName, this);
  }

  static visualObserver = new VisualObserverManager();

  #visualObserver = (this.constructor as typeof Standoff).visualObserver;

  /** A CSS selector for the source of the standoff. */
  @property({ type: String, reflect: true }) source: string = '';
  #sourceElement: Element | null = null;
  #sourceRect!: DOMRectReadOnly;
  #sourceCallback = (entry: VisualObserverEntry) => {
    this.#sourceRect = entry.contentRect;
    this.requestUpdate();
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unobserveSource();
  }

  #observeSource() {
    this.#unobserveSource();
    this.#sourceElement = document.querySelector(this.source);

    if (!this.#sourceElement) {
      throw new Error('source is not a valid element');
    }

    this.#visualObserver.observe(this.#sourceElement, this.#sourceCallback);
  }

  #unobserveSource() {
    if (this.#sourceElement === null) return;

    this.#visualObserver.unobserve(this.#sourceElement, this.#sourceCallback);
  }

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);

    if (!this.source) return;

    if (changedProperties.has('source')) {
      this.#observeSource();
    }

    if (this.#sourceRect === undefined || this.#sourceElement === null) return;

    this.render(this.#sourceRect, this.#sourceElement);
  }

  // @ts-ignore
  render(sourceRect: DOMRectReadOnly, sourceElement: Element) {}
}
