import { AbstractSet } from './abstract-set.js';

export class SDFContour extends AbstractSet {
  static tagName = 'sdf-contour';

  render(sourceRects: ReadonlyMap<Element, DOMRectReadOnly>): void {
    console.log(sourceRects);
  }
}
