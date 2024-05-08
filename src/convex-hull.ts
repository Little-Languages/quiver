import { AbstractSet } from './abstract-set.js';

export class ConvexHull extends AbstractSet {
  static tagName = 'convex-hull';

  render(sourceRects: ReadonlyMap<Element, DOMRectReadOnly>): void {
    console.log(sourceRects);
  }
}
