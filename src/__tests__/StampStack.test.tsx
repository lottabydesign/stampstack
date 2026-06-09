// src/__tests__/StampStack.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StampStack } from '../StampStack'

const items = [
  { id: 'lagos', title: 'Lagos' },
  { id: 'abuja', title: 'Abuja' },
  { id: 'kano', title: 'Kano' },
]

function renderStamp(item: { id: string; title: string }) {
  return <span>{item.title}</span>
}

describe('StampStack', () => {
  it('calls renderStamp for every item and renders its content', () => {
    render(<StampStack items={items} renderStamp={renderStamp} />)
    expect(screen.getByText('Lagos')).toBeInTheDocument()
    expect(screen.getByText('Abuja')).toBeInTheDocument()
    expect(screen.getByText('Kano')).toBeInTheDocument()
  })

  it('marks the focused card with state.focused = true via renderStamp', () => {
    const spy = vi.fn((item: { id: string; title: string }, _state: import('../types').StampState) => <span>{item.title}</span>)
    render(<StampStack items={items} renderStamp={spy} initialIndex={1} />)
    // The item at initialIndex 1 (Abuja) should have been called with focused=true.
    const abujaCall = spy.mock.calls.find(([item]) => item.id === 'abuja')
    expect(abujaCall?.[1]).toMatchObject({ focused: true, index: 1 })
  })

  it('fires onFocusChange on mount with the initial index', () => {
    const onFocusChange = vi.fn()
    render(<StampStack items={items} renderStamp={renderStamp} initialIndex={2} onFocusChange={onFocusChange} />)
    expect(onFocusChange).toHaveBeenCalledWith(2)
  })

  it('moves focus right on ArrowRight and reports it', () => {
    const onFocusChange = vi.fn()
    render(<StampStack items={items} renderStamp={renderStamp} initialIndex={0} onFocusChange={onFocusChange} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(onFocusChange).toHaveBeenLastCalledWith(1)
  })

  it('applies frameColor to the card wrapper as the --stampstack-frame variable', () => {
    render(
      <StampStack
        items={items}
        renderStamp={renderStamp}
        frameColor={(item) => (item.id === 'lagos' ? 'rgb(255, 0, 0)' : 'rgb(0, 128, 0)')}
      />,
    )
    // The wrapper is the .stampstack-card-wrapper ancestor of the rendered content.
    // Its inline style must carry the per-item color as the CSS variable the frame reads.
    const lagosWrapper = screen.getByText('Lagos').closest('.stampstack-card-wrapper') as HTMLElement
    const abujaWrapper = screen.getByText('Abuja').closest('.stampstack-card-wrapper') as HTMLElement
    expect(lagosWrapper.style.getPropertyValue('--stampstack-frame')).toBe('rgb(255, 0, 0)')
    expect(abujaWrapper.style.getPropertyValue('--stampstack-frame')).toBe('rgb(0, 128, 0)')
  })
})
