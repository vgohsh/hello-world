import type { Tally } from './db'

export function tallyCsv(rows: Tally[]): string {
  const lines = ['date,text,count', ...[...rows].sort((a, b) => a.day.localeCompare(b.day) || a.textId.localeCompare(b.textId)).map((r) => `${r.day},${r.textId},${r.count}`)]
  return lines.join('\n') + '\n'
}

export function download(name: string, content: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
