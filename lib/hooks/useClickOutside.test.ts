import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useClickOutside } from '@/lib/hooks/useClickOutside'

/**
 * Helper to dispatch a mousedown event on a target element
 */
function fireMouseDown(target: EventTarget) {
  const event = new MouseEvent('mousedown', { bubbles: true })
  target.dispatchEvent(event)
}

describe('useClickOutside', () => {
  it('calls handler when clicking outside the ref element', () => {
    const handler = vi.fn()
    const outside = document.createElement('div')
    document.body.appendChild(outside)

    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLElement>(document.createElement('div'))
      useClickOutside(ref, handler)
      return ref
    })

    fireMouseDown(outside)
    expect(handler).toHaveBeenCalledTimes(1)

    unmount()
    document.body.removeChild(outside)
  })

  it('does not call handler when clicking inside the ref element', () => {
    const handler = vi.fn()
    const container = document.createElement('div')
    const child = document.createElement('span')
    container.appendChild(child)
    document.body.appendChild(container)

    renderHook(() => {
      const ref = useRef<HTMLElement>(container)
      useClickOutside(ref, handler)
    })

    fireMouseDown(child)
    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(container)
  })

  it('does not call handler when disabled', () => {
    const handler = vi.fn()
    const outside = document.createElement('div')
    document.body.appendChild(outside)

    renderHook(() => {
      const ref = useRef<HTMLElement>(document.createElement('div'))
      useClickOutside(ref, handler, false)
    })

    fireMouseDown(outside)
    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(outside)
  })

  it('supports an array of refs', () => {
    const handler = vi.fn()
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')
    const outside = document.createElement('div')
    document.body.appendChild(el1)
    document.body.appendChild(el2)
    document.body.appendChild(outside)

    renderHook(() => {
      const ref1 = useRef<HTMLElement>(el1)
      const ref2 = useRef<HTMLElement>(el2)
      useClickOutside([ref1, ref2], handler)
    })

    // Click on el1 — inside, should not fire
    fireMouseDown(el1)
    expect(handler).not.toHaveBeenCalled()

    // Click on el2 — inside, should not fire
    fireMouseDown(el2)
    expect(handler).not.toHaveBeenCalled()

    // Click outside both — should fire
    fireMouseDown(outside)
    expect(handler).toHaveBeenCalledTimes(1)

    document.body.removeChild(el1)
    document.body.removeChild(el2)
    document.body.removeChild(outside)
  })

  it('cleans up the event listener on unmount', () => {
    const handler = vi.fn()
    const outside = document.createElement('div')
    document.body.appendChild(outside)

    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLElement>(document.createElement('div'))
      useClickOutside(ref, handler)
    })

    unmount()

    fireMouseDown(outside)
    expect(handler).not.toHaveBeenCalled()

    document.body.removeChild(outside)
  })
})
