import { TEXTS } from './content'

export const MANTRAS = TEXTS.filter((t) => t.kind === 'mantra')
/** Default accumulation goals, editable in the tracker. */
export const DEFAULT_GOALS: Record<string, number> = { vajrasattva: 100_000, 'om-mani': 1_000_000 }
