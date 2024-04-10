# Perfect Arrow

> A custom element to declaratively define arrows between HTML elements. Steve Ruiz's [perfect-arrows](https://github.com/steveruizok/perfect-arrows) powers to arrow layout and Sam Thor's [viz-observer](https://github.com/samthor/viz-observer) to observer the movement and resizing of elements.

> [!WARNING]  
> This library is still in development. 🚧 Use at your own risk. It's also not published to NPM yet.

## Usage

1. Install the NPM package [`perfect-arrow`](#) using a package manager of your choice.

2. Register the custom element and start using it in HTML

```html
<div id="box1"></div>
<div id="box2"></div>
<perfect-arrow type="box" source="box1" target="box2"></perfect-arrow>

<script type="module">
  import { PerfectArrow } from 'perfect-arrow';

  // Register the `<perfect-arrow>` custom element.
  PerfectArrow.register();
</script>
```

## API

### Required attributes/properties

- `source`: A CSS selector for the element that is the source of the arrow.
- `target`: A CSS selector for the element that is the target of the arrow.

### Optional attributes/properties

- `type`: The type of layout algorithm to use: 'box' or 'point'. See `perfect-arrows`'s [`getBoxToBoxArrow`](https://github.com/steveruizok/perfect-arrows/tree/master?tab=readme-ov-file#getboxtoboxarrowx0-y0-w0-h0-x1-y1-w1-h1-options) and [`getArrow`](https://github.com/steveruizok/perfect-arrows/tree/master?tab=readme-ov-file#getarrowx0-y0-x1-y1-options), respectively.
- `bow`: A value representing the natural bow of the arrow. At `0`, all lines will be straight.
- `stretch`: The effect that the arrow's length will have, relative to its `minStretch` and `maxStretch`, on the bow of the arrow. At `0`, the stretch will have no effect.
- `stretch-min`: The length of the arrow where the line should be most stretched. Shorter distances than this will have no additional effect on the bow of the arrow.
- `stretch-max`: The length of the arrow at which the stretch should have no effect.
- `pad-start`: How far the arrow's starting point should be from the provided start point.
- `pad-end`: How far the arrow's ending point should be from the provided end point.
- `flip`: Whether to reflect the arrow's bow angle.
- `straights`: Whether to use straight lines at 45 degree angles.

#### Default values

Here are the default values of optional attributes

```html
<perfect-arrow
  type="box"
  source="#box1"
  target="#box2"
  bow="0"
  stretch=".25"
  stretch-min="50"
  stretch-max="420"
  pad-start="0"
  pad-end="20"
  straights
></perfect-arrow>
```
