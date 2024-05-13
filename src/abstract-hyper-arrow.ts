import { ReactiveElement, PropertyValues } from '@lit/reactive-element';
import { property } from '@lit/reactive-element/decorators.js';
import { VisualObserverManager } from './visual-observer.js';
import { VisualObserverEntry } from 'viz-observer';

// Very WIP
export class AbstractHyperArrow extends ReactiveElement {
  static tagName = 'hyper-arrow';

  static register() {
    customElements.define(this.tagName, this);
  }

  static visualObserver = new VisualObserverManager();

  #visualObserver = (this.constructor as typeof AbstractHyperArrow).visualObserver;

  /** A CSS selector for the source(s) of the arrow. */
  @property({ type: String, reflect: true }) sources: string = '';
  #sourceElements: Element[] = [];
  #sourceRects = new Map<Element, DOMRectReadOnly>();
  #sourcesCallback = (entry: VisualObserverEntry) => {
    this.#sourceRects.set(entry.target, entry.contentRect);
    this.requestUpdate();
  };

  /** A CSS selector for the target(s) of the arrow. */
  @property({ type: String, reflect: true }) targets: string = '';
  #targetElements: Element[] = [];
  #targetRects = new Map<Element, DOMRectReadOnly>();
  #targetsCallback = (entry: VisualObserverEntry) => {
    this.#targetRects.set(entry.target, entry.contentRect);
    this.requestUpdate();
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unobserveSources();
    this.#unobserveTargets();
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

  #observeTargets() {
    this.#unobserveTargets();

    this.#targetElements = Array.from(document.querySelectorAll(this.targets));

    this.#updateTargets();
  }

  #updateTargets() {
    if (this.#targetElements.length === 0) return;

    const elementsToUnObserve = new Set(this.#targetElements);

    this.#targetElements.forEach((el) => {
      elementsToUnObserve.delete(el); // Delete any elements that are in the DOM.

      if (this.#targetRects.has(el)) return;

      this.#visualObserver.observe(el, this.#targetsCallback);
    });

    elementsToUnObserve.forEach((el) => {
      this.#visualObserver.unobserve(el, this.#targetsCallback);
      this.#targetRects.delete(el);
    });
  }

  #unobserveTargets() {
    for (const el of this.#targetElements) {
      this.#visualObserver.unobserve(el, this.#targetsCallback);
    }
    this.#targetRects.clear();
  }

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);

    if (!this.sources || !this.targets) {
      return;
    }

    if (changedProperties.has('sources')) {
      this.#observeSources();
    } else {
      this.#updateSources();
    }

    if (changedProperties.has('targets')) {
      this.#observeTargets();
    } else {
      this.#updateTargets();
    }

    if (this.#sourceRects.size === 0 || this.#targetRects.size === 0) return;

    this.render(this.#sourceRects, this.#targetRects);
  }

  render(
    // @ts-ignore
    sourceRects: ReadonlyMap<Element, DOMRectReadOnly>,
    // @ts-ignore
    targetRects: ReadonlyMap<Element, DOMRectReadOnly>
  ) {
    console.log(sourceRects, targetRects);
  }
}
