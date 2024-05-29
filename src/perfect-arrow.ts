import { AbstractArrow } from './abstract-arrow.js';
import { property } from '@lit/reactive-element/decorators.js';
import { getArrow, getBoxToBoxArrow, ArrowOptions } from 'perfect-arrows';

export type ArrowType = 'point' | 'box';

export type Arrow = [
  /** The x position of the (padded) starting point. */
  sx: number,
  /** The y position of the (padded) starting point. */
  sy: number,
  /** The x position of the control point. */
  cx: number,
  /** The y position of the control point. */
  cy: number,
  /** The x position of the (padded) ending point. */
  ex: number,
  /** The y position of the (padded) ending point. */
  ey: number,
  /** The angle (in radians) for an ending arrowhead. */
  ae: number,
  /** The angle (in radians) for a starting arrowhead. */
  as: number,
  /** The angle (in radians) for a center arrowhead. */
  ac: number
];

export class PerfectArrow extends AbstractArrow {
  static tagName = 'perfect-arrow';

  /** The type of layout algorithm to use: 'box' or 'point'. */
  @property({ type: String }) type: ArrowType = 'box';

  /** A value representing the natural bow of the arrow. At `0`, all lines will be straight. */
  @property({ type: Number }) bow: number = 0;

  /** The effect that the arrow's length will have, relative to its `minStretch` and `maxStretch`, on the bow of the arrow. At `0`, the stretch will have no effect. */
  @property({ type: Number }) stretch: number = 0.25;

  /** The length of the arrow where the line should be most stretched. Shorter distances than this will have no additional effect on the bow of the arrow. */
  @property({ type: Number, attribute: 'stretch-min' }) stretchMin: number = 50;

  /** The length of the arrow at which the stretch should have no effect. */
  @property({ type: Number, attribute: 'stretch-max' }) stretchMax: number = 420;

  /** How far the arrow's starting point should be from the provided start point. */
  @property({ type: Number, attribute: 'pad-start' }) padStart: number = 0;

  /** How far the arrow's ending point should be from the provided end point. */
  @property({ type: Number, attribute: 'pad-end' }) padEnd: number = 20;

  /** Whether to reflect the arrow's bow angle. */
  @property({ type: Boolean }) flip: boolean = false;

  /** Whether to use straight lines at 45 degree angles. */
  @property({ type: Boolean }) straights: boolean = true;

  #svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  #circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  #path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  #polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

  getArrow(sourceBox: DOMRectReadOnly, targetBox: DOMRectReadOnly, options: ArrowOptions): Arrow {
    switch (this.type) {
      case 'point': {
        const sourceX = sourceBox.x + sourceBox.width / 2;
        const sourceY = sourceBox.y + sourceBox.height / 2;
        const targetX = targetBox.x + targetBox.width / 2;
        const targetY = targetBox.y + targetBox.height / 2;
        return getArrow(sourceX, sourceY, targetX, targetY, options) as Arrow;
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
        ) as Arrow;
      }
    }
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();
    this.style.pointerEvents = 'none';

    this.#svg.setAttribute('part', 'svg-arrow');
    this.#svg.setAttribute('stroke', '#000');
    this.#svg.setAttribute('fill', '#000');
    this.#svg.setAttribute('stroke-width', '3');
    this.#svg.style.height = '100%';
    this.#svg.style.width = '100%';
    this.#svg.style.pointerEvents = 'none';

    this.#circle.setAttribute('r', '4');
    this.#circle.style.pointerEvents = 'all';

    this.#path.setAttribute('fill', 'none');
    this.#path.style.pointerEvents = 'all';

    this.#polygon.setAttribute('points', '0,-6 12,0, 0,6');
    this.#polygon.style.pointerEvents = 'all';

    this.#svg.append(this.#circle, this.#path, this.#polygon);
    root.append(this.#svg);

    return root;
  }

  arrow: Arrow = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  render(sourceRect: DOMRectReadOnly, targetRect: DOMRectReadOnly): void {
    const [sx, sy, cx, cy, ex, ey, ae] = (this.arrow = this.getArrow(sourceRect, targetRect, {
      bow: this.bow,
      stretch: this.stretch,
      stretchMin: this.stretchMin,
      stretchMax: this.stretchMax,
      padStart: this.padStart,
      padEnd: this.padEnd,
      flip: this.flip,
      straights: this.straights,
    }));

    const endAngleAsDegrees = ae * (180 / Math.PI);

    this.#circle.setAttribute('cx', sx.toString());
    this.#circle.setAttribute('cy', sy.toString());

    this.#path.setAttribute('d', `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`);

    this.#polygon.setAttribute('transform', `translate(${ex},${ey}) rotate(${endAngleAsDegrees})`);
  }
}
