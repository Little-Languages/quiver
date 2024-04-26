import { VisualObserver, VisualObserverEntry } from 'viz-observer';

type VisualObserverEntryCallback = (entry: VisualObserverEntry) => void;

export class VisualObserverManager {
  #elementCount = new WeakMap<Element, number>();
  #elementMap = new WeakMap<Element, Set<VisualObserverEntryCallback>>();

  #vo = new VisualObserver((entries) => {
    for (const entry of entries) {
      const callbacks = this.#elementMap.get(entry.target);

      if (callbacks) {
        callbacks.forEach((callback) => callback(entry));
      }
    }
  });

  observe(target: Element, callback: VisualObserverEntryCallback): void {
    let callbacks = this.#elementMap.get(target);

    if (callbacks === undefined) {
      this.#vo.observe(target);
      this.#elementMap.set(target, (callbacks = new Set()));
      this.#elementCount.set(target, 0);
    }

    callbacks.add(callback);
    this.#elementCount.set(target, this.#elementCount.get(target)! + 1);
  }

  unobserve(target: Element, callback: VisualObserverEntryCallback): void {
    const count = this.#elementCount.get(target);

    if (count === undefined || count === 0) return;

    if (count > 1) {
      this.#elementCount.set(target, this.#elementCount.get(target)! - 1);
      return;
    }

    let callbacks = this.#elementMap.get(target);

    if (callbacks === undefined) return;

    callbacks.delete(callback);

    if (callbacks.size === 0) {
      this.#vo.unobserve(target);
      this.#elementMap.delete(target);
    }
  }
}
