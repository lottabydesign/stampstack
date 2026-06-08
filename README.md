# stampstack

A draggable 3D coverflow of scalloped postage-stamp cards. The library owns the
stamp frame and the fan mechanics; **you bring the content.**

## Install

```bash
npm install stampstack
```

## Usage

```tsx
import { StampStack } from 'stampstack'
import 'stampstack/styles.css'

const items = [
  { id: 'lagos', name: 'Lagos' },
  { id: 'abuja', name: 'Abuja' },
]

<StampStack
  items={items}
  renderStamp={(item, state) => (
    <div style={{ opacity: state.focused ? 1 : 0.8 }}>{item.name}</div>
  )}
  onSelect={(item) => console.log('open', item.id)}
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `T[]` (each needs `id`) | — | Your data. Only `id` is required. |
| `renderStamp` | `(item, state) => ReactNode` | — | Fills each stamp with your DOM. |
| `onSelect` | `(item, index) => void` | — | Fires on a genuine tap of a visible card. |
| `onFocusChange` | `(index) => void` | — | Fires when the focused card changes. |
| `frameColor` | `(item, state) => string` | — | Per-stamp frame color. Omit for one color via the `--stampstack-frame` variable. |
| `initialIndex` | `number` | `0` | Which card starts focused. |
| `cardWidth` | `number` | `260` | Card width in px. |
| `className` | `string` | — | Extra class on the root `.stampstack` element. |
| `style` | `CSSProperties` | — | Inline styles on the root element (e.g. to set height). |

`state` is `{ focused, index, offset }` — use it to dim or change content on
non-focused cards.

## Theming

Import `stampstack/styles.css` for the frame, then override CSS variables:

```css
.stampstack {
  --stampstack-frame: hotpink;                            /* frame fill color */
  --stampstack-radius: 16px;                              /* inner content corner radius */
  --stampstack-ease: cubic-bezier(0.34, 1.56, 0.64, 1);  /* the snap transition curve */
  --stampstack-perspective: 800px;                        /* 3D depth (smaller = more dramatic) */
}
```

The library sets **no font** — your `renderStamp` content brings its own.

## Controls

- **Drag / flick** to move through the fan
- **Arrow keys** move focus; **Enter** opens the focused card
- **Click** a visible card to open it
