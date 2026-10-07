import { expect, test } from '@playwright/test'

test('starts in English and remembers Chinese after a reload', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { name: 'Learn to chant' })).toBeVisible()

  await page.getByRole('button', { name: '中文', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans')
  await expect(page.getByRole('heading', { name: '学习念诵' })).toBeVisible()
  await expect(page.getByRole('link', { name: '复习' })).toBeVisible()
  await expect(page).toHaveTitle('藏文念诵')

  // meanings switch too
  await page.getByRole('link', { name: /金刚萨埵百字明咒/ }).click()
  await expect(page.getByText('请守护（此誓言）')).toBeVisible()
  await expect(page.getByText('protect it')).toHaveCount(0)

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans')
  await expect(page.getByText('请守护（此誓言）')).toBeVisible()

  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page.getByText('protect it')).toBeVisible()
})

test('Chinese phonetics line follows the language until set by hand', async ({ page }) => {
  await page.goto('/text/vajrasattva')
  await expect(page.getByText('嗡 班杂 萨埵 萨玛雅', { exact: false })).toHaveCount(0)
  await page.getByRole('button', { name: '中文', exact: true }).click()
  await expect(page.getByText('嗡 班杂 萨埵 萨玛雅', { exact: false }).first()).toBeVisible()
})

test('tap a syllable to see its readings and parts', async ({ page }) => {
  await page.goto('/text/vajrasattva')
  await page.getByRole('button', { name: 'སཏྭ — sato' }).first().click()
  const sheet = page.getByRole('dialog', { name: 'Syllable' })
  await expect(sheet).toBeVisible()
  await expect(sheet.getByText('sattva', { exact: true }).first()).toBeVisible()
  await expect(sheet.getByText(/wa-zur/).first()).toBeVisible()
  await expect(sheet.getByText('Vajrasattva — "vajra being", the Buddha of purification')).toBeVisible()
  await sheet.getByRole('button', { name: 'Close' }).click()
  await expect(sheet).toBeHidden()
})

test('switching pronunciation changes the phonetics', async ({ page }) => {
  await page.goto('/text/vajrasattva')
  const first = page.getByTestId('phrase').first().getByTestId('phon')
  await expect(first).toContainText('benza sato')
  await page.getByRole('link', { name: 'Settings' }).click()
  await page.getByRole('button', { name: 'Sanskrit', exact: true }).click()
  await page.goBack()
  await expect(first).toContainText('vajra sattva')
})

test('karaoke highlights syllables while playing', async ({ page }) => {
  await page.goto('/text/om-mani')
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(page.locator('.syl[data-active="true"]')).toHaveCount(1)
  await page.getByRole('button', { name: 'Pause' }).click()
})

test('the mala counts a full round of 108', async ({ page }) => {
  await page.goto('/practice/mala')
  const tap = page.getByTestId('mala-tap')
  await expect(tap).toBeVisible()
  for (let i = 0; i < 107; i++) await page.keyboard.press('Space')
  await expect(page.getByTestId('mala-count')).toHaveText('107')
  await tap.click()
  await expect(page.getByTestId('mala-count')).toHaveText('0')
  await expect(page.getByText('1 round', { exact: true })).toBeVisible()
  await page.goto('/practice/tracker')
  await expect(page.getByText('today: 108').first()).toBeVisible()
})

test('memorize, review and the reading drill work', async ({ page }) => {
  await page.goto('/text/om-mani/memorize')
  await page.getByRole('button', { name: 'Add to review' }).click()
  await expect(page.getByText('In your daily review')).toBeVisible()
  await page.getByRole('link', { name: 'Review' }).click()
  await page.getByRole('button', { name: 'Show answer' }).click()
  await expect(page.getByTestId('answer')).toContainText('om mani peme hung')
  await page.getByRole('button', { name: /Good/ }).click()
  await expect(page.getByText(/All done for now/)).toBeVisible()

  await page.goto('/text/vajrasattva/script')
  await page.getByRole('button', { name: 'Reading drill' }).click()
  await expect(page.getByText('How is this syllable read?')).toBeVisible()
})

test('works offline after the first visit', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium')
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload() // let the service worker control the page
  await context.setOffline(true)
  await page.goto('/text/vajrasattva')
  await expect(page.getByTestId('phrase')).toHaveCount(17)
  await expect(page.getByText('protect it')).toBeVisible()
  await context.setOffline(false)
})
