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
