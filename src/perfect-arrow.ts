import { AbstractArrow } from './abstract-arrow.js';
import { property } from '@lit/reactive-element/decorators.js';
import { getArrow, getBoxToBoxArrow, ArrowOptions } from 'perfect-arrows';

const safeThreshold = 50;

export type ArrowType = 'point' | 'box';

export type BoundingBox = {
  /** The minimum x-coordinate of the bounding box. */
  min_x: number,
  /** The maximum x-coordinate of the bounding box. */
  max_x: number,
  /** The minimum y-coordinate of the bounding box. */
  min_y: number,
  /** The maximum y-coordinate of the bounding box. */
  max_y: number,
};

export type RelativeBox = {
  /** The distance from the left edge of the container. */
  left: number,
  /** The distance from the right edge of the container. */
  right: number,
  /** The distance from the top edge of the container. */
  top: number,
  /** The distance from the bottom edge of the container. */
  bottom: number,
  /** The width of the box. */
  width: number,
  /** The height of the box. */
  height: number,
};

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

  getRelativeBox(element: Element, boundingBox: BoundingBox) : RelativeBox {
    const {min_x, min_y } = boundingBox;
  
    return {
      "left": element.offsetLeft - min_x,
      "right": element.offsetLeft + element.offsetWidth - min_x,
      "bottom": element.offsetTop + element.offsetHeight - min_y,
      "top": element.offsetTop - min_y,
      "height": element.offsetHeight,
      "width": element.offsetWidth
    };
  };

  getArrow(sourceBox: RelativeBox, targetBox: RelativeBox, options: ArrowOptions): Arrow {
    switch (this.type) {
      case 'point': {
        const sourceX = sourceBox.left + sourceBox.width / 2;
        const sourceY = sourceBox.top + sourceBox.height / 2;
        const targetX = targetBox.left + targetBox.width / 2;
        const targetY = targetBox.top + targetBox.height / 2;
        return getArrow(sourceX, sourceY, targetX, targetY, options) as Arrow;
      }
      case 'box': {
        return getBoxToBoxArrow(
          sourceBox.left, sourceBox.top, sourceBox.width, sourceBox.height,
          targetBox.left, targetBox.top, targetBox.width, targetBox.height,
          options
        ) as Arrow;
      }
    }
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();

    this.#svg.setAttribute('part', 'svg-arrow');
    this.#svg.setAttribute('stroke', '#000');
    this.#svg.setAttribute('fill', '#000');
    this.#svg.setAttribute('strokeWidth', '3');
    this.#svg.style.position = 'absolute';
    this.#circle.setAttribute('r', '4');

    this.#path.setAttribute('fill', 'none');

    this.#polygon.setAttribute('points', '0,-6 12,0, 0,6');

    this.#svg.append(this.#circle, this.#path, this.#polygon);
    root.append(this.#svg);

    return root;
  }

  arrow: Arrow = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  render(sourceRect: DOMRectReadOnly, targetRect: DOMRectReadOnly, sourceElement: Element, targetElement: Element): void {
    const min_x = Math.min(sourceElement.offsetLeft, targetElement.offsetLeft) - safeThreshold;
    const max_x = Math.max(sourceElement.offsetLeft + sourceElement.offsetWidth, targetElement.offsetLeft + targetElement.offsetWidth) + safeThreshold;
    const min_y = Math.min(sourceElement.offsetTop, targetElement.offsetTop) - safeThreshold;
    const max_y = Math.max(sourceElement.offsetTop + sourceElement.offsetHeight, targetElement.offsetTop + targetElement.offsetHeight) + safeThreshold;

    const boundingBox = { min_x, max_x, min_y, max_y };
    const sourceRelativeBox = this.getRelativeBox(sourceElement, boundingBox);
    const targetRelativeBox = this.getRelativeBox(targetElement, boundingBox);
    
    const [sx, sy, cx, cy, ex, ey, ae] = (this.arrow = this.getArrow(sourceRelativeBox, targetRelativeBox,
      {
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

    const path = `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`;
    this.#path.setAttribute('d', path);
        
    this.#svg.style.width = `${max_x - min_x}px`;
    this.#svg.style.height = `${max_y - min_y}px`;
    this.#svg.style.transform = `translate(${min_x}px, ${min_y}px)`;

    this.#polygon.setAttribute('transform', `translate(${ex},${ey}) rotate(${endAngleAsDegrees})`);
  }
}
