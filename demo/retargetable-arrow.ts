import { PerfectArrow } from '../src/perfect-arrow.ts';

export class RetargetableArrow extends PerfectArrow {
  static tagName = 'retargetable-arrow';

  #targetBeforeDrag = '';

  constructor() {
    super();

    this.addEventListener('pointerdown', this);
    this.addEventListener('lostpointercapture', this);
  }

  validTarget(): string {
    return this.getAttribute('valid-target') || '';
  }

  targetSelector(element): string {
    return element.matches(`#${element.id}`);
  }

  handleEvent(event: PointerEvent) {
    switch (event.type) {
      case 'pointerdown': {
        const target = event.composedPath()[0];

        if (!(target instanceof Element) || target.tagName !== 'polygon') return;

        this.addEventListener('pointermove', this);
        this.setPointerCapture(event.pointerId);
        this.#targetBeforeDrag = this.target;
        this.style.opacity = '0.5';
        return;
      }
      case 'pointermove': {
        const element = document.elementFromPoint(event.clientX, event.clientY);

        if (element === null) return;

        this.target = this.validTarget() ? this.targetSelector(element) : this.#targetBeforeDrag;
        return;
      }
      case 'lostpointercapture': {
        this.#targetBeforeDrag = '';
        this.style.opacity = '';
        this.removeEventListener('pointermove', this);
        return;
      }
    }
  }
}
