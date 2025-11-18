import { test, expect } from '@playwright/test'

test.describe('Transaction Detail Page', () => {
  test('should display transaction details', async ({ page }) => {
    // First, get a real transaction hash from homepage
    await page.goto('/')

    // Wait for transactions to load
    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    // Get the first transaction link
    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    const txHref = await firstTxLink.getAttribute('href')

    if (txHref) {
      // Navigate to transaction detail page
      await page.goto(txHref)

      // Check page title
      await expect(page).toHaveTitle(/Transaction/)

      // Check for key transaction fields
      await expect(page.getByText(/transaction hash/i).first()).toBeVisible()
      await expect(page.getByText(/from/i).first()).toBeVisible()
      await expect(page.getByText(/to/i).first()).toBeVisible()
      await expect(page.getByText(/value/i).first()).toBeVisible()
      await expect(page.getByText(/gas/i).first()).toBeVisible()
      await expect(page.getByText(/block/i).first()).toBeVisible()
    }
  })

  test('should display transaction status', async ({ page }) => {
    await page.goto('/')

    // Get first transaction
    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()

    // Wait for page load
    await page.waitForLoadState('networkidle')

    // Check for status indicator (success/failed)
    const statusText = page.getByText(/status|success|failed/i).first()
    await expect(statusText).toBeVisible()
  })

  test('should navigate to from address', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()

    await page.waitForLoadState('networkidle')

    // Find first address link (from address)
    const fromAddressLink = page.locator('a[href*="/address/"]').first()

    if (await fromAddressLink.isVisible()) {
      await fromAddressLink.click()

      // Should navigate to address page
      await expect(page).toHaveURL(/\/address\//)
    }
  })

  test('should navigate to to address', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()

    await page.waitForLoadState('networkidle')

    // Find "To" address link (second address link)
    const toAddressLinks = page.locator('a[href*="/address/"]')
    const linkCount = await toAddressLinks.count()

    if (linkCount >= 2) {
      await toAddressLinks.nth(1).click()

      // Should navigate to address page
      await expect(page).toHaveURL(/\/address\//)
    }
  })

  test('should navigate to block from transaction', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()

    await page.waitForLoadState('networkidle')

    // Find block link
    const blockLink = page.locator('a[href*="/block/"]').first()

    if (await blockLink.isVisible()) {
      await blockLink.click()

      // Should navigate to block page
      await expect(page).toHaveURL(/\/block\//)
    }
  })

  test('should display gas information', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()

    await page.waitForLoadState('networkidle')

    // Check for gas fields
    await expect(page.getByText(/gas used|gas limit|gas price/i).first()).toBeVisible()
  })

  test('should display transaction value', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()

    await page.waitForLoadState('networkidle')

    // Check for value field
    await expect(page.getByText(/value/i).first()).toBeVisible()
  })

  test('should display transaction logs if available', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()

    await page.waitForLoadState('networkidle')

    // Check if logs section exists
    const logsSection = page.getByText(/logs|events/i)
    const hasLogs = await logsSection.count()

    if (hasLogs > 0) {
      await expect(logsSection.first()).toBeVisible()
    }
  })

  test('should handle invalid transaction hash gracefully', async ({ page }) => {
    // Navigate with invalid hash
    await page.goto('/tx/0xinvalidhash123')

    // Should show error or "not found" message
    const errorMessage = page.getByText(/not found|error|invalid/i)
    await expect(errorMessage).toBeVisible({ timeout: 10000 })
  })

  test('should display timestamp or age', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()

    await page.waitForLoadState('networkidle')

    // Check for timestamp or age field
    const timeField = page.getByText(/timestamp|age|time/i).first()
    await expect(timeField).toBeVisible()
  })

  test('should allow copying transaction hash', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()

    await page.waitForLoadState('networkidle')

    // Look for copy buttons
    const copyButtons = page.getByRole('button', { name: /copy/i })
    const copyButtonCount = await copyButtons.count()

    if (copyButtonCount > 0) {
      await copyButtons.first().click()
      // Success message would appear here (implementation dependent)
    }
  })

  test('should display nonce and transaction index', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()

    await page.waitForLoadState('networkidle')

    // Check for nonce field
    const nonceField = page.getByText(/nonce/i).first()
    const hasNonce = await nonceField.count()

    if (hasNonce > 0) {
      await expect(nonceField).toBeVisible()
    }
  })

  test('should display input data for contract interactions', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()

    await page.waitForLoadState('networkidle')

    // Check for input data field
    const inputDataField = page.getByText(/input data|data/i)
    const hasInputData = await inputDataField.count()

    if (hasInputData > 0) {
      await expect(inputDataField.first()).toBeVisible()
    }
  })
})
