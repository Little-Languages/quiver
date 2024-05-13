import { ReactiveElement, PropertyValues } from '@lit/reactive-element';
import { property } from '@lit/reactive-element/decorators.js';
import { VisualObserverManager } from './visual-observer.js';
import { VisualObserverEntry } from 'viz-observer';

// Very WIP
export class AbstractSet extends ReactiveElement {
  static tagName = 'abstract-set';

  static register() {
    customElements.define(this.tagName, this);
  }

  static visualObserver = new VisualObserverManager();

  #visualObserver = (this.constructor as typeof AbstractSet).visualObserver;

  /** A CSS selector for the source(s) of the arrow. */
  @property({ type: String, reflect: true }) sources: string = '';
  #sourceElements: Element[] = [];
  #sourceRects = new Map<Element, DOMRectReadOnly>();
  #sourcesCallback = (entry: VisualObserverEntry) => {
    this.#sourceRects.set(entry.target, entry.contentRect);
    this.requestUpdate();
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unobserveSources();
  }

  #observeSources() {
    this.#unobserveSources();
    this.#sourceElements = Array.from(document.querySelectorAll(this.sources));
    this.#updateSources();
  }

  #updateSources() {
    if (this.#sourceElements.length === 0) return;

    const elementsToUnObserve = new Set(this.#sourceElements);

    this.#sourceElements.forEach((el) => {
      elementsToUnObserve.delete(el); // Delete any elements that are in the DOM.

      if (this.#sourceRects.has(el)) return;

      this.#visualObserver.observe(el, this.#sourcesCallback);
    });

    elementsToUnObserve.forEach((el) => {
      this.#visualObserver.unobserve(el, this.#sourcesCallback);
      this.#sourceRects.delete(el);
    });
  }

  #unobserveSources() {
    for (const el of this.#sourceElements) {
      this.#visualObserver.unobserve(el, this.#sourcesCallback);
    }
    this.#sourceRects.clear();
  }

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);

    if (!this.sources) {
      return;
    }

    if (changedProperties.has('sources')) {
      this.#observeSources();
    } else {
      this.#updateSources();
    }

    if (this.#sourceRects.size === 0) return;

    this.render(this.#sourceRects);
  }

  render(
    // @ts-ignore
    sourceRects: ReadonlyMap<Element, DOMRectReadOnly>
  ) {
    console.log(sourceRects);
  }
}
