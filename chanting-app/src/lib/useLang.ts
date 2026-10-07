import { useSettings } from './settings'
import type { Bilingual } from './content'

/** Returns a picker for bilingual content in the current app language. */
export function useLang() {
  const { settings } = useSettings()
  const lang = settings.lang
  return { lang, L: (b: Bilingual) => b[lang] }
}
