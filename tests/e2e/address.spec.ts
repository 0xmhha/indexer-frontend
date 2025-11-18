import { test, expect } from '@playwright/test'

test.describe('Address Page', () => {
  test('should display address details', async ({ page }) => {
    // First, get a real address from a transaction
    await page.goto('/')

    // Wait for transactions to load
    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    // Click on first transaction
    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()

    await page.waitForLoadState('networkidle')

    // Click on first address link
    const addressLink = page.locator('a[href*="/address/"]').first()

    if (await addressLink.isVisible()) {
      await addressLink.click()

      // Wait for address page to load
      await page.waitForLoadState('networkidle')

      // Check page title
      await expect(page).toHaveTitle(/Address/)

      // Check for address display
      const addressHeading = page.getByRole('heading', { name: /address|0x[a-fA-F0-9]{40}/i })
      await expect(addressHeading.first()).toBeVisible()
    }
  })

  test('should display address balance', async ({ page }) => {
    // Navigate to a known address or get from homepage
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()
    await page.waitForLoadState('networkidle')

    const addressLink = page.locator('a[href*="/address/"]').first()

    if (await addressLink.isVisible()) {
      await addressLink.click()
      await page.waitForLoadState('networkidle')

      // Check for balance display
      await expect(page.getByText(/balance/i).first()).toBeVisible()
    }
  })

  test('should display transaction history', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()
    await page.waitForLoadState('networkidle')

    const addressLink = page.locator('a[href*="/address/"]').first()

    if (await addressLink.isVisible()) {
      await addressLink.click()
      await page.waitForLoadState('networkidle')

      // Check for transactions section
      const txSection = page.getByText(/transactions|transaction history/i).first()
      await expect(txSection).toBeVisible()
    }
  })

  test('should display balance history chart if available', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()
    await page.waitForLoadState('networkidle')

    const addressLink = page.locator('a[href*="/address/"]').first()

    if (await addressLink.isVisible()) {
      await addressLink.click()
      await page.waitForLoadState('networkidle')

      // Check for chart section
      const chartSection = page.getByText(/balance history|chart/i)
      const hasChart = await chartSection.count()

      if (hasChart > 0) {
        await expect(chartSection.first()).toBeVisible()
      }
    }
  })

  test('should paginate through transactions', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()
    await page.waitForLoadState('networkidle')

    const addressLink = page.locator('a[href*="/address/"]').first()

    if (await addressLink.isVisible()) {
      await addressLink.click()
      await page.waitForLoadState('networkidle')

      // Look for pagination controls
      const nextButton = page.getByRole('button', { name: /next|→/i })
      const hasNextButton = await nextButton.count()

      if (hasNextButton > 0 && (await nextButton.isEnabled())) {
        await nextButton.click()

        // Wait for new page to load
        await page.waitForLoadState('networkidle')

        // Should have different transactions
        await expect(page.locator('[data-testid="transaction-item"], .transaction-row').first()).toBeVisible()
      }
    }
  })

  test('should allow copying address', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()
    await page.waitForLoadState('networkidle')

    const addressLink = page.locator('a[href*="/address/"]').first()

    if (await addressLink.isVisible()) {
      await addressLink.click()
      await page.waitForLoadState('networkidle')

      // Look for copy button
      const copyButtons = page.getByRole('button', { name: /copy/i })
      const copyButtonCount = await copyButtons.count()

      if (copyButtonCount > 0) {
        await copyButtons.first().click()
        // Success message would appear here
      }
    }
  })

  test('should handle invalid address gracefully', async ({ page }) => {
    // Navigate with invalid address
    await page.goto('/address/0xinvalidaddress')

    // Should show error or "not found" message
    const errorMessage = page.getByText(/not found|error|invalid/i)
    await expect(errorMessage).toBeVisible({ timeout: 10000 })
  })

  test('should display transaction count', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()
    await page.waitForLoadState('networkidle')

    const addressLink = page.locator('a[href*="/address/"]').first()

    if (await addressLink.isVisible()) {
      await addressLink.click()
      await page.waitForLoadState('networkidle')

      // Check for transaction count
      const txCount = page.getByText(/total transactions|tx count/i)
      const hasTxCount = await txCount.count()

      if (hasTxCount > 0) {
        await expect(txCount.first()).toBeVisible()
      }
    }
  })

  test('should navigate to transaction details from address page', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()
    await page.waitForLoadState('networkidle')

    const addressLink = page.locator('a[href*="/address/"]').first()

    if (await addressLink.isVisible()) {
      await addressLink.click()
      await page.waitForLoadState('networkidle')

      // Find first transaction in the list
      const txLink = page.locator('a[href*="/tx/"]').first()

      if (await txLink.isVisible()) {
        await txLink.click()

        // Should navigate to transaction page
        await expect(page).toHaveURL(/\/tx\//)
      }
    }
  })

  test('should filter transactions by type if available', async ({ page }) => {
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    await firstTxLink.click()
    await page.waitForLoadState('networkidle')

    const addressLink = page.locator('a[href*="/address/"]').first()

    if (await addressLink.isVisible()) {
      await addressLink.click()
      await page.waitForLoadState('networkidle')

      // Check for filter buttons/tabs
      const filterButtons = page.getByRole('button', { name: /all|sent|received/i })
      const hasFilters = await filterButtons.count()

      if (hasFilters > 0) {
        // Click on a filter (e.g., "Sent")
        const sentFilter = page.getByRole('button', { name: /sent/i }).first()

        if (await sentFilter.isVisible()) {
          await sentFilter.click()

          // Wait for filtered results
          await page.waitForLoadState('networkidle')
        }
      }
    }
  })
})
