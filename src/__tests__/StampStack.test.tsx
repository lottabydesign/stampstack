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

  it('opens the focused card via window Enter', () => {
    const onSelect = vi.fn()
    render(<StampStack items={items} renderStamp={renderStamp} initialIndex={1} onSelect={onSelect} />)
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(items[1], 1)
  })

  it('opens a card when Enter is pressed on the card element itself', () => {
    const onSelect = vi.fn()
    render(<StampStack items={items} renderStamp={renderStamp} initialIndex={0} onSelect={onSelect} />)
    // The focused card (index 0, "Lagos") is a role=button with the item text inside it.
    const card = screen.getByText('Lagos').closest('[role="button"]') as HTMLElement
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(items[0], 0)
  })
})
