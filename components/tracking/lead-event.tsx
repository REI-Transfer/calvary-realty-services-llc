"use client"

import { useEffect } from "react"

export function LeadEvent() {
  useEffect(() => {
    // Only fire when the survey just submitted: it stores a one-time event id
    // in sessionStorage. Direct visits and reloads of /thank-you fire nothing.
    let eventId: string | null = null
    try {
      eventId = sessionStorage.getItem("lead_event_id")
    } catch {}

    if (!eventId) return

    const fire = () => {
      if (typeof window !== "undefined" && window.fbq) {
        // eventID matches meta_event_id sent to the webhook so Meta can dedup
        // the browser fire against the server-side CAPI fire.
        window.fbq("track", "Lead", {}, { eventID: eventId })
        try {
          sessionStorage.removeItem("lead_event_id")
        } catch {}
        return true
      }
      return false
    }

    // Try immediately
    if (fire()) return

    // Poll until fbq is available (pixel loads async)
    const interval = setInterval(() => {
      if (fire()) clearInterval(interval)
    }, 200)

    // Give up after 10s
    const timeout = setTimeout(() => clearInterval(interval), 10000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  return null
}
