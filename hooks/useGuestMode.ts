'use client'
// hooks/useGuestMode.ts
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

const GUEST_KEY = 'unsaid_guest_start'
const GUEST_LIMIT_MS = 5 * 60 * 1000 // 5 minutes

export function useGuestMode() {
  const { isSignedIn, isLoaded } = useUser()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!isLoaded || isSignedIn) return

    // Record when guest browsing started
    const existing = localStorage.getItem(GUEST_KEY)
    if (!existing) {
      localStorage.setItem(GUEST_KEY, Date.now().toString())
      return
    }

    const elapsed = Date.now() - parseInt(existing)
    if (elapsed >= GUEST_LIMIT_MS) {
      setShowModal(true)
    } else {
      const remaining = GUEST_LIMIT_MS - elapsed
      const timer = setTimeout(() => setShowModal(true), remaining)
      return () => clearTimeout(timer)
    }
  }, [isLoaded, isSignedIn])

  const dismiss = () => {
    // Give 2 more minutes
    localStorage.setItem(GUEST_KEY, (Date.now() - GUEST_LIMIT_MS + 2 * 60 * 1000).toString())
    setShowModal(false)
  }

  return { showGuestModal: showModal, dismissGuestModal: dismiss }
}
