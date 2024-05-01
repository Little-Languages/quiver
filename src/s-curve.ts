import { AbstractArrow } from './abstract-arrow.js';
import { property } from '@lit/reactive-element/decorators.js';
import { getArrow, getBoxToBoxArrow, ArrowOptions } from 'curved-arrows';

export type ArrowType = 'point' | 'box';

export type Curve = [
  /** The x position of the (padded) starting point. */
  sx: number,
  /** The y position of the (padded) starting point. */
  sy: number,
  /** The x position of the control point of the starting point. */
  cx1: number,
  /** The y position of the control point of the starting point. */
  cy1: number,
  /** The x position of the center point. */
  cx2: number,
  /** The y position of the center point. */
  cy2: number,
  /** The x position of the (padded) ending point. */
  ex: number,
  /** The y position of the (padded) ending point. */
  ey: number,
  /** The angle (in radians) for an ending arrowhead. */
  ae: number,
  /** The angle (in radians) for a starting arrowhead. */
  as: number
];

export class SCurve extends AbstractArrow {
  static tagName = 's-curve';

  /** The type of layout algorithm to use: 'box' or 'point'. */
  @property({ type: String }) type: ArrowType = 'box';

  @property({ type: String, attribute: 'control-point-stretch' }) controlPointStretch = 50;

  /** How far the arrow's starting point should be from the provided start point. */
  @property({ type: Number, attribute: 'pad-start' }) padStart: number = 0;

  /** How far the arrow's ending point should be from the provided end point. */
  @property({ type: Number, attribute: 'pad-end' }) padEnd: number = 10;

  #svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  #circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  #path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  #polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

  getCurve(sourceBox: DOMRectReadOnly, targetBox: DOMRectReadOnly, options: ArrowOptions): Curve {
    switch (this.type) {
      case 'point': {
        const sourceX = sourceBox.x + sourceBox.width / 2;
        const sourceY = sourceBox.y + sourceBox.height / 2;
        const targetX = targetBox.x + targetBox.width / 2;
        const targetY = targetBox.y + targetBox.height / 2;
        return getArrow(sourceX, sourceY, targetX, targetY, options) as Curve;
      }
      case 'box': {
        return getBoxToBoxArrow(
          sourceBox.x,
          sourceBox.y,
          sourceBox.width,
          sourceBox.height,
          targetBox.x,
          targetBox.y,
          targetBox.width,
          targetBox.height,
          options
        ) as Curve;
      }
    }
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();

    this.#svg.setAttribute('stroke', '#000');
    this.#svg.setAttribute('fill', '#000');
    this.#svg.setAttribute('stroke-width', '3');
    this.#svg.style.height = '100%';
    this.#svg.style.width = '100%';

    this.#circle.setAttribute('r', '4');

    this.#path.setAttribute('fill', 'none');

    this.#polygon.setAttribute('points', '0,-6 12,0, 0,6');

    this.#svg.append(this.#path, this.#polygon);
    root.append(this.#svg);

    return root;
  }

  curve: Curve = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  render(sourceRect: DOMRectReadOnly, targetRect: DOMRectReadOnly): void {
    const [sx, sy, cx1, cy1, cx2, cy2, ex, ey, ae] = (this.curve = this.getCurve(
      sourceRect,
      targetRect,
      {
        padStart: this.padStart,
        padEnd: this.padEnd,
        // It seems like this option been published/documented yet.
        // controlPointStretch: this.controlPointStretch,
      }
    ));

    this.#circle.setAttribute('cx', sx.toString());
    this.#circle.setAttribute('cy', sy.toString());

    this.#path.setAttribute('d', `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${ex} ${ey}`);

    this.#polygon.setAttribute('transform', `translate(${ex},${ey}) rotate(${ae})`);
  }
}
