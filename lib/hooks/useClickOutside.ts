'use client'

import { useEffect, type RefObject } from 'react'

/**
 * Hook to detect clicks outside of referenced elements.
 * Calls the handler when a mousedown event occurs outside all provided refs.
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  handler: () => void,
  enabled: boolean = true,
) {
  useEffect(() => {
    if (!enabled) {return}

    const refArray = Array.isArray(refs) ? refs : [refs]

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const isOutside = refArray.every(
        (ref) => ref.current && !ref.current.contains(target)
      )
      if (isOutside) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [refs, handler, enabled])
}
