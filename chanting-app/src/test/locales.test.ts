import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import en from '../locales/en.json'
import zh from '../locales/zh-Hans.json'

type Tree = { [k: string]: string | Tree }
const PLURAL = /_(zero|one|two|few|many|other)$/

function keys(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([k, v]) => (typeof v === 'string' ? [(prefix + k).replace(PLURAL, '')] : keys(v, `${prefix}${k}.`)))
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) return f === 'test' ? [] : sourceFiles(p)
    return /\.tsx?$/.test(f) && !f.endsWith('.test.ts') ? [p] : []
  })
}

describe('locales', () => {
  const enKeys = new Set(keys(en))
  const zhKeys = new Set(keys(zh))

  it('English and Chinese have the same keys', () => {
    expect([...enKeys].filter((k) => !zhKeys.has(k))).toEqual([])
    expect([...zhKeys].filter((k) => !enKeys.has(k))).toEqual([])
  })

  it('Chinese plural keys use the "other" form', () => {
    const zhRaw = JSON.stringify(zh)
    expect(zhRaw).not.toMatch(/_one"/)
  })

  it('every literal key used in the code exists', () => {
    const src = join(dirname(fileURLToPath(import.meta.url)), '..')
    const used = new Set<string>()
    for (const f of sourceFiles(src)) {
      for (const m of readFileSync(f, 'utf8').matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) used.add(m[1])
    }
    expect(used.size).toBeGreaterThan(100)
    expect([...used].filter((k) => !enKeys.has(k))).toEqual([])
  })
})
