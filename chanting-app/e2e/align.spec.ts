import { expect, test } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** A 20-second tone as a WAV file, so the test needs no fixtures. */
function toneWav(): string {
  const rate = 8000
  const n = rate * 20
  const buf = Buffer.alloc(44 + n * 2)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(rate, 24)
  buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40)
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(6000 * Math.sin((2 * Math.PI * 220 * i) / rate)), 44 + i * 2)
  const path = join(tmpdir(), 'chant-tone.wav')
  writeFileSync(path, buf)
  return path
}

test('alignment tool: tap along, export and use the timings in the lesson', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium')
  test.setTimeout(60_000)
  await page.goto('/tools/align')
  await page.getByLabel('Text').selectOption('om-mani')
  await page.getByLabel('Recording').setInputFiles(toneWav())
  const play = page.getByRole('button', { name: /Play \/ pause/ })
  await expect(play).toBeEnabled()
  await play.click()
  await expect(page.getByRole('button', { name: /Mark syllable/ })).toBeEnabled()
  await page.locator('h1').click() // move focus off the buttons so Space marks
  for (let i = 0; i < 6; i++) { // 5 syllable starts + the end of the last one
    await page.waitForTimeout(300)
    await page.keyboard.press('Space')
  }
  await expect(page.getByText(/Drag the edges/)).toBeVisible()

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: /Export JSON/ }).click()
  const file = await (await download).path()
  const json = JSON.parse(readFileSync(file, 'utf8'))
  expect(json.textId).toBe('om-mani')
  const syls = json.phrases[0].syllables
  expect(syls).toHaveLength(5)
  for (let i = 1; i < syls.length; i++) expect(syls[i].start).toBeGreaterThan(syls[i - 1].start)

  await page.getByRole('button', { name: /Use in the app/ }).click()
  await expect(page.getByText(/Saved\./)).toBeVisible()
  await page.goto('/text/om-mani')
  await expect(page.getByTestId('phrase')).toHaveCount(1)
  await expect(page.getByText('Placeholder voice')).toHaveCount(0) // now plays the real recording
})
