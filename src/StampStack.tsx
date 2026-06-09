// src/StampStack.tsx
import { useStampFan } from './useStampFan'
import { StampFrame } from './StampFrame'
import type { StampStackProps } from './types'

export function StampStack<T extends { id: string }>({
  items,
  renderStamp,
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
  })

  return (
    <div className={className ? `stampstack ${className}` : 'stampstack'} style={style}>
      <div
        ref={fan.sceneRef}
        onPointerDown={fan.onPointerDown}
        className="stampstack-scene"
      >
        <div className="stampstack-track">
          {items.map((item, index) => {
            const state = fan.getCardState(index)
            return (
              <div
                key={item.id}
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
