import { VisualObserver, VisualObserverEntry } from './vo.js';

type VisualObserverEntryCallback = (entry: VisualObserverEntry) => void;

export class VisualObserverManager {
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
    } else {
      callback({ target, contentRect: target.getBoundingClientRect(), isAppearing: true });
    }

    callbacks.add(callback);
  }

  unobserve(target: Element, callback: VisualObserverEntryCallback): void {
    let callbacks = this.#elementMap.get(target);

    if (callbacks === undefined) return;

    callbacks.delete(callback);

    if (callbacks.size === 0) {
      this.#vo.unobserve(target);
      this.#elementMap.delete(target);
    }
  }
}
