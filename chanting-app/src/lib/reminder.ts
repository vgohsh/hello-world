import { useEffect } from 'react'
import i18n from '../i18n'
import { useSettings } from './settings'

/** Milliseconds until the next HH:MM in local time. */
export function msUntil(time: string, now = new Date()): number {
  const [h, m] = time.split(':').map(Number)
  const next = new Date(now)
  next.setHours(h, m, 0, 0)
  if (next <= now) next.setDate(next.getDate() + 1)
  return next.getTime() - now.getTime()
}

async function notify() {
  const title = i18n.t('reminder.title')
  const body = i18n.t('reminder.body')
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) await reg.showNotification(title, { body, icon: '/icon-192.png', tag: 'practice' })
    else new Notification(title, { body, icon: '/icon-192.png' })
  } catch {
    /* notifications unavailable */
  }
}

/**
 * Daily practice reminder. There is no push server, so it only fires while the app
 * (or its tab) is open; the settings page says so.
 */
export function useReminder() {
  const { settings } = useSettings()
  const { enabled, time } = settings.reminder
  useEffect(() => {
    if (!enabled || typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    let timer = 0
    const schedule = () => {
      timer = window.setTimeout(() => {
        void notify()
        schedule()
      }, msUntil(time))
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [enabled, time])
}
