// Renders public/icon.svg to the PNG icons the PWA manifest needs. Run: node scripts/make-icons.mjs
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'
const svg = readFileSync('public/icon.svg', 'utf8')
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
const page = await browser.newPage()
const font = 'node_modules/@fontsource/noto-serif-tibetan/files/noto-serif-tibetan-tibetan-400-normal.woff2'
const b64 = readFileSync(font).toString('base64')
for (const size of [192, 512]) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<style>@font-face{font-family:T;src:url(data:font/woff2;base64,${b64})}html,body{margin:0}svg{width:${size}px;height:${size}px;display:block}text{font-family:T!important}</style>${svg}`)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `public/icon-${size}.png`, omitBackground: true })
}
await browser.close()
