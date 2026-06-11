// src/StampStack.tsx
import { useStampFan } from './useStampFan'
import { StampFrame } from './StampFrame'
import type { StampStackProps } from './types'

export function StampStack<T extends { id: string }>({
  items,
  renderStamp,
  onSelect,
  onFocusChange,
  frameColor,
  initialIndex = 0,
  cardWidth = 260,
  className,
  style,
}: StampStackProps<T>) {
  const fan = useStampFan({
    itemCount: items.length,
    initialIndex,
    cardWidth,
    onFocusChange,
    // Adapt the hook's index-based callback to the public (item, index) shape.
    onSelect: onSelect ? (i) => onSelect(items[i], i) : undefined,
  })

  // Only when onSelect is provided do stamps become interactive (button role,
  // keyboard activation). Without it, they're inert presentational cards.
  const clickable = !!onSelect

  return (
    <div className={className ? `stampstack ${className}` : 'stampstack'} style={style}>
      <div
        ref={fan.sceneRef}
        onPointerDown={fan.onPointerDown}
        // Cancel native HTML5 drag (the browser's "drag the image out" ghost),
        // which any <img>/<a> in consumer content triggers and which fights our
        // pointer-based fan drag.
        onDragStart={(e) => e.preventDefault()}
        // Scene-level click delegation → accurate front-most-card hit-test.
        onClick={fan.onSceneClick}
        className="stampstack-scene"
      >
        <div className="stampstack-track">
          {items.map((item, index) => {
            const state = fan.getCardState(index)
            const interactive = fan.isInteractive(index)
            return (
              <div
                key={item.id}
                className="stampstack-card-wrapper"
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? (interactive ? 0 : -1) : undefined}
                aria-current={clickable && state.focused ? true : undefined}
                onKeyDown={clickable ? (e) => fan.handleCardKeyDown(index, e) : undefined}
                style={{
                  position: 'absolute',
                  willChange: 'transform',
                  // Set on the wrapper (ancestor of both frame + content) so the
                  // frame's `fill: var(--stampstack-frame)` picks it up per stamp.
                  ...(frameColor
                    ? { ['--stampstack-frame' as string]: frameColor(item, state) }
                    : {}),
                  ...fan.getCardStyle(index),
                }}
              >
                <StampFrame>{renderStamp(item, state)}</StampFrame>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
