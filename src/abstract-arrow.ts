import { ReactiveElement, PropertyValues } from '@lit/reactive-element';
import { property } from '@lit/reactive-element/decorators.js';
import { VisualObserverManager } from './visual-observer.js';
import { VisualObserverEntry } from 'viz-observer';

export class AbstractArrow extends ReactiveElement {
  static tagName = 'abstract-arrow';

  static register() {
    customElements.define(this.tagName, this);
  }

  static visualObserver = new VisualObserverManager();

  visualObserver = (this.constructor as typeof AbstractArrow).visualObserver;

  /** A CSS selector for the source of the arrow. */
  @property({ type: String, reflect: true }) source: string = '';
  sourceElement: Element | null = null;
  sourceRect!: DOMRectReadOnly;
  sourceCallback = (entry: VisualObserverEntry) => {
    this.sourceRect = entry.contentRect;
    this.requestUpdate();
  };

  /** A CSS selector for the target of the arrow. */
  @property({ type: String, reflect: true }) target: string = '';
  targetElement: Element | null = null;
  targetRect!: DOMRectReadOnly;
  targetCallback = (entry: VisualObserverEntry) => {
    this.targetRect = entry.contentRect;
    this.requestUpdate();
  };

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unobserveSource();
    this.unobserveTarget();
  }

  observeSource() {
    this.unobserveSource();
    this.sourceElement = document.querySelector(this.source);

    if (!this.sourceElement) {
      throw new Error('source is not a valid element');
    }

    this.visualObserver.observe(this.sourceElement, this.sourceCallback);
  }

  unobserveSource() {
    if (this.sourceElement === null) return;

    this.visualObserver.unobserve(this.sourceElement, this.sourceCallback);
  }

  observeTarget() {
    this.unobserveTarget();
    this.targetElement = document.querySelector(this.target);

    if (!this.targetElement) {
      throw new Error('target is not a valid element');
    }

    this.visualObserver.observe(this.targetElement, this.targetCallback);
  }

  unobserveTarget() {
    if (this.targetElement === null) return;

    this.visualObserver.unobserve(this.targetElement, this.targetCallback);
  }

  update(changedProperties: PropertyValues) {
    super.update(changedProperties);

    if (!this.source || !this.target) return;

    if (changedProperties.has('source')) {
      this.observeSource();
    }

    if (changedProperties.has('target')) {
      this.observeTarget();
    }

    if (
      this.sourceRect === undefined ||
      this.targetRect === undefined ||
      this.sourceElement === null ||
      this.targetElement === null
    )
      return;

    this.render(this.sourceRect, this.targetRect, this.sourceElement, this.targetElement);
  }

  render(
    // @ts-ignore
    sourceRect: DOMRectReadOnly,
    // @ts-ignore
    targetRect: DOMRectReadOnly,
    // @ts-ignore
    sourceElement: Element,
    // @ts-ignore
    targetElement: Element
  ) {}
}
