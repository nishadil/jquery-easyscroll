# jquery-easyscroll
A jQuery plugin for scrolling a set of images/elements easily

## Note
EasyScroll : a scroll-tastic jQuery plugin 
Inspired from jquery-simplyscroll 

Last revised: 07/01/2024


Note : The original project on github (simplyscroll) was marked as lagecy and we were not getting new updates on that, so we made some modification and make it available for all with new name.

## Features

- **Smooth Scrolling:** Creates smooth transition effects when navigating between sections of a webpage.
- **Customizable Scrolling Speed:** Control the speed of the scrolling animation to fit your design needs.
- **Customizable Easing:** Supports different easing functions to create more natural scrolling animations.
- **Orientation Support:** Choose between horizontal and vertical scrolling.
- **Auto-Scrolling:** Automatically scroll through content with loop or bounce modes.
- **Pause on Hover/Touch:** Optionally pause scrolling when hovering or touching the scrollable area.
- **Manual Controls:** Provide buttons for manual scrolling.
- **Loop and Bounce Modes:** Scroll continuously in a loop or bounce back at the end of the content.
- **Touch Support:** Fully supports touch events for mobile devices.
- **Customizable Styling:** Easily customize the look and feel using CSS.

## Installation

You can install the `jquery-easyscroll` package using npm:

```bash
npm install jquery-easyscroll
```

This package publishes ESM, CommonJS, and UMD builds via the following entry points:

- ESM: `dist/jquery.easyscroll.esm.js` (module-aware bundlers)
- CommonJS: `dist/jquery.easyscroll.cjs` (Node/CommonJS)
- UMD: `dist/jquery.easyscroll.umd.js` (browser globals)

Alternatively, you can include the plugin and CSS directly in your HTML file (UMD build):

```html
<link rel="stylesheet" href="path/to/jquery.easyscroll.css">
<script src="path/to/jquery.easyscroll.umd.js"></script>
```

## Usage

After installing or including the plugin, you can use it in your project like this:

### Basic Initialization (jQuery Plugin)

```javascript
import EasyScroll from 'jquery-easyscroll';

$(document).ready(function() {
    $('.your-selector').easyScroll();
});
```

Or using the class directly:

```javascript
$(document).ready(function() {
    new EasyScroll('.your-selector', {
        // your options here
    });
});
```

### CommonJS

```javascript
const EasyScroll = require('jquery-easyscroll');
// or: const { default: EasyScroll } = require('jquery-easyscroll');

$(document).ready(function() {
    $('.your-selector').easyScroll();
});
```

### Browser (UMD)

```html
<link rel="stylesheet" href="path/to/jquery.easyscroll.css">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="path/to/jquery.easyscroll.umd.js"></script>
<script>
    $(function() {
        $('.your-selector').easyScroll();
    });
</script>
```

### Example Usage

Here’s a more detailed example:

```javascript
new EasyScroll('.scrollable-content', {
    customClass: 'custom-scroll',
    speed: 2,
    orientation: 'vertical',
    auto: true,
    autoMode: 'loop',
    direction: 'forwards',
    pauseOnHover: true,
    pauseOnTouch: true,
    startOnLoad: false,
    initialOffset: 100,
});
```

### HTML Example

```html
<div class="scrollable-content">
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
        <li>Item 4</li>
    </ul>
</div>

<link rel="stylesheet" href="path/to/jquery.easyscroll.css">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="path/to/jquery.easyscroll.umd.js"></script>
<script>
    $(document).ready(function() {
        new EasyScroll('.scrollable-content', {
            customClass: 'custom-scroll',
            speed: 3,
            orientation: 'horizontal',
            auto: true,
            autoMode: 'bounce',
            direction: 'forwards',
            pauseOnHover: true,
        });
    });
</script>
```

## CSS Customization

The `jquery.easyscroll.css` file provides a set of default styles that can be easily customized. Below are some key classes and how they are used:

### Master Classes

- `.easy-scroll-container`: The main container that wraps the entire scrollable content.
- `.easy-scroll-clip`: A wrapper around the list that manages the overflow and hides the non-visible parts.
- `.easy-scroll-list`: The list of items that scrolls.
- `.easy-scroll-btn`: The buttons for manual control, like left/right or up/down.
- `.easy-scroll-btn-left`, `.easy-scroll-btn-right`, `.easy-scroll-btn-up`, `.easy-scroll-btn-down`: Specific classes for directional buttons.

### Example Markup for Horizontal Scroller

```html
<div class="your-custom-class easy-scroll-container">
    <div class="easy-scroll-btn easy-scroll-btn-left"></div>
    <div class="easy-scroll-btn easy-scroll-btn-right"></div>
    <div class="easy-scroll-clip">
        <ul class="easy-scroll-list">
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
            <li>Item 4</li>
        </ul>
    </div>
</div>
```

### Vertical Scroller Example

```css
.vert {
    width: 340px;
    height: 400px;
    margin-bottom: 1.5em;
}

.vert .easy-scroll-clip {
    width: 290px;
    height: 400px;
}

.vert .easy-scroll-list li {
    width: 290px;
    height: 200px;
}
```

### Customizing Buttons

The CSS file includes styles for customizing the buttons. You can replace `buttons.png` with your own button sprites or adjust the `background-position` values to match your custom sprites.

### Example of Overriding Styles

```css
.custom-scroll .easy-scroll-btn-left {
    background-image: url('path/to/your-custom-button.png');
}

.custom-scroll .easy-scroll-btn-right {
    background-image: url('path/to/your-custom-button.png');
}
```

## License

This project is open-source and available under the [MIT License](LICENSE).

## Contribution

We welcome contributions! If you have ideas or improvements, feel free to submit a pull request or open an issue.

## Development

Build:

```bash
npm run build
```

Test:

```bash
npm test
```

## Credits

This plugin is developed and maintained by the [Nishadil Developers Team](https://github.com/NishadilDev), part of Nishadil's OpenSources projects.
