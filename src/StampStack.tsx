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
    onSelect: onSelect ? (i) => onSelect(items[i], i) : undefined,
    onFocusChange,
  })

  return (
    <div className={className ? `stampstack ${className}` : 'stampstack'} style={style}>
      <div
        ref={fan.sceneRef}
        onPointerDown={fan.onPointerDown}
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
                role="button"
                tabIndex={interactive ? 0 : -1}
                aria-current={state.focused ? true : undefined}
                onKeyDown={(e) => fan.handleCardKeyDown(index, e)}
                className="stampstack-card-wrapper"
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
