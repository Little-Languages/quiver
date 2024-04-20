import { ReactiveElement, PropertyValues } from '@lit/reactive-element';
import { property } from '@lit/reactive-element/decorators.js';
import vizObserver, { Rect } from 'viz-observer';

export type { Rect };

// Very WIP
export class AbstractHyperArrow extends ReactiveElement {
  static tagName = 'hyper-arrow';

  static register() {
    customElements.define(this.tagName, this);
  }

  /** A CSS selector for the source(s) of the arrow. */
  @property({ type: String, reflect: true }) sources: string = '';
  #sourcesCleanup = new Map<Element, () => void>();
  #sourceElements!: NodeListOf<Element>;
  #sourceRects = new Map<Element, Rect>();

  /** A CSS selector for the target(s) of the arrow. */
  @property({ type: String, reflect: true }) targets: string = '';
  #targetsCleanup = new Map<Element, () => void>();
  #targetElements!: NodeListOf<Element>;
  #targetRects = new Map<Element, Rect>();

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#unobserveSources();
    this.#unobserveTargets();
  }

  #observerSources() {
    this.#unobserveSources();
    this.#sourceElements = document.querySelectorAll(this.sources);
    this.#updateSources();
  }

  #updateSources() {
    const trackedElements = new Set(this.#sourcesCleanup.keys());

    this.#sourceElements.forEach((el) => {
      trackedElements.delete(el); // Delete any elements that are in the DOM.

      if (this.#sourcesCleanup.has(el)) return;

      this.#sourcesCleanup.set(
        el,
        vizObserver(el, (rect) => {
          this.#sourceRects.set(el, rect);
          this.requestUpdate();
        })
      );
    });

    trackedElements.forEach((el) => {
      this.#sourcesCleanup.get(el)?.();
      this.#sourcesCleanup.delete(el);
      this.#sourceRects.delete(el);
    });
  }

  #unobserveSources() {
    this.#sourcesCleanup.forEach((cleanup) => cleanup());
    this.#sourcesCleanup.clear();
    this.#sourceRects.clear();
  }

  #observeTargets() {
    this.#unobserveTargets();

    this.#targetElements = document.querySelectorAll(this.targets);

    this.#updateTargets();
  }

  #updateTargets() {
    const trackedElements = new Set(this.#targetsCleanup.keys());

    this.#targetElements.forEach((el) => {
      trackedElements.delete(el); // Delete any elements that are in the DOM.

      if (this.#targetsCleanup.has(el)) return;

      this.#targetsCleanup.set(
        el,
        vizObserver(el, (rect) => {
          this.#targetRects.set(el, rect);
          this.requestUpdate();
        })
      );
    });

    trackedElements.forEach((el) => {
      this.#targetsCleanup.get(el)?.();
      this.#targetsCleanup.delete(el);
      this.#targetRects.delete(el);
    });
  }

  #unobserveTargets() {
    this.#targetsCleanup.forEach((cleanup) => cleanup());
    this.#targetsCleanup.clear();
    this.#targetRects.clear();
  }

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);

    if (!this.sources || !this.targets) {
      return;
    }

    if (changedProperties.has('sources')) {
      this.#observerSources();
    } else {
      this.#updateSources();
    }

    if (changedProperties.has('targets')) {
      this.#observeTargets();
    } else {
      this.#updateTargets();
    }

    if (this.targets)
      this.render(this.#sourceRects, this.#targetRects, this.#sourceElements, this.#targetElements);
  }

  render(
    // @ts-ignore
    sourceRects: ReadonlyMap<Element, Rect>,
    // @ts-ignore
    targetRects: ReadonlyMap<Element, Rect>,
    // @ts-ignore
    sourceElements: NodeListOf<Element>,
    // @ts-ignore
    targetElements: NodeListOf<Element>
  ) {
    console.log(sourceRects, targetRects, sourceElements, targetElements);
  }
}
