export class DraggableBox extends HTMLElement {
  static tagName = 'draggable-box';

  static register() {
    customElements.define(this.tagName, this);
  }

  constructor() {
    super();

    this.onMouseDrag = this.onMouseDrag.bind(this);

    this.addEventListener('mousedown', () => {
      window.addEventListener('mousemove', this.onMouseDrag);
    });

    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', this.onMouseDrag);
    });
  }

  onMouseDrag({ movementX, movementY }) {
    const { left, top } = window.getComputedStyle(this);
    const leftValue = parseInt(left);
    const topValue = parseInt(top);
    this.style.left = `${leftValue + movementX}px`;
    this.style.top = `${topValue + movementY}px`;
  }
}
