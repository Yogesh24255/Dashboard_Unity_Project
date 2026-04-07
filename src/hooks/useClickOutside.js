import { useEffect, useRef } from 'react'

/**
 * Custom hook to detect clicks outside a referenced element
 * @param {Function} callback - Function to call when click is detected outside
 * @returns {Object} ref - Ref to attach to the element
 */
export function useClickOutside(callback) {
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [callback])

  return ref
}
