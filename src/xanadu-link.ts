import { AbstractArrow, Rect } from './abstract-arrow.js';

export class XanaduLink extends AbstractArrow {
  static tagName = 'xanadu-link';

  connectionEl = document.createElement('div');

  bg = 'rgba(185, 233, 219, 0.75)';

  protected createRenderRoot() {
    const root = super.createRenderRoot();

    this.connectionEl.style.position = 'absolute';
    this.connectionEl.style.backgroundColor = this.bg;

    root.append(this.connectionEl);
    return root;
  }

  render(sourceRect: Rect, targetRect: Rect, sourceElement: Element, targetElement: Element): void {
    if (!(sourceElement instanceof HTMLElement) || !(targetElement instanceof HTMLElement)) return;

    // TODO: if the target or source change then we don't undo this 😬
    sourceElement.style.backgroundColor = targetElement.style.backgroundColor = this.bg;

    const top = Math.min(sourceRect.y, targetRect.y);
    const left = sourceRect.x + sourceRect.width;
    const width = targetRect.x - (sourceRect.x + sourceRect.width);
    const height = Math.max(
      targetRect.y + targetRect.height - sourceRect.y,
      sourceRect.y + sourceRect.height - targetRect.y
    );

    this.connectionEl.style.top = `${top}px`;
    this.connectionEl.style.left = `${left}px`;
    this.connectionEl.style.width = `${width}px`;
    this.connectionEl.style.height = `${height}px`;
    if (height === 0) {
      this.connectionEl.style.clipPath = '';
    } else {
      const p1 = (Math.max(sourceRect.y - top, 0) / height) * 100;
      const p2 = (Math.max(sourceRect.y + sourceRect.height - top, 0) / height) * 100;
      const p3 = (Math.max(targetRect.y + targetRect.height - top, 0) / height) * 100;
      const p4 = (Math.max(targetRect.y - top, 0) / height) * 100;

      this.connectionEl.style.clipPath = `polygon(0 ${p1}%, 0 ${p2}%, 100% ${p3}%, 100% ${p4}%)`;
    }
  }
}
