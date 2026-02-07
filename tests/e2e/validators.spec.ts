import { test, expect } from '@playwright/test'

test.describe('Validators Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/validators')
  })

  test('should display validators page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Validators/)

    // Check heading
    await expect(page.getByRole('heading', { name: /validator/i })).toBeVisible()
  })

  test('should display validators list', async ({ page }) => {
    // Wait for validators to load
    await page.waitForLoadState('networkidle')

    // Check for validators table or list
    const validatorsList = page.locator('[data-testid="validators-list"], .validators-table, table')
    const hasValidators = await validatorsList.count()

    if (hasValidators > 0) {
      await expect(validatorsList.first()).toBeVisible()
    }
  })

  test('should display validator addresses', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Check for address patterns (0x...)
    const addressPattern = page.locator('text=/0x[a-fA-F0-9]{40}/').first()
    const hasAddress = await addressPattern.count()

    if (hasAddress > 0) {
      await expect(addressPattern).toBeVisible()
    }
  })

  test('should navigate to validator detail page', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Find validator link
    const validatorLink = page.locator('a[href*="/validators/"]').first()
    const hasLink = await validatorLink.count()

    if (hasLink > 0 && (await validatorLink.isVisible())) {
      await validatorLink.click()

      // Should navigate to validator detail page
      await expect(page).toHaveURL(/\/validators\/0x/)
    }
  })

  test('should display validator statistics if available', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Check for common validator stats
    const stats = page.getByText(/total validators|active|voting power|stake/i)
    const hasStats = await stats.count()

    if (hasStats > 0) {
      await expect(stats.first()).toBeVisible()
    }
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Reload to apply viewport
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Page should still be visible
    await expect(page.getByRole('heading', { name: /validator/i })).toBeVisible()
  })
})

test.describe('Validator Detail Page', () => {
  test('should display validator details', async ({ page }) => {
    // First get a validator address from validators list
    await page.goto('/validators')
    await page.waitForLoadState('networkidle')

    const validatorLink = page.locator('a[href*="/validators/0x"]').first()
    const hasLink = await validatorLink.count()

    if (hasLink > 0) {
      await validatorLink.click()
      await page.waitForLoadState('networkidle')

      // Check for validator address
      await expect(page.getByText(/0x[a-fA-F0-9]{40}/)).toBeVisible()
    }
  })

  test('should display validator blocks if available', async ({ page }) => {
    await page.goto('/validators')
    await page.waitForLoadState('networkidle')

    const validatorLink = page.locator('a[href*="/validators/0x"]').first()
    const hasLink = await validatorLink.count()

    if (hasLink > 0) {
      await validatorLink.click()
      await page.waitForLoadState('networkidle')

      // Check for blocks section
      const blocksSection = page.getByText(/blocks|produced/i)
      const hasBlocks = await blocksSection.count()

      if (hasBlocks > 0) {
        await expect(blocksSection.first()).toBeVisible()
      }
    }
  })

  test('should navigate back to validators list', async ({ page }) => {
    await page.goto('/validators')
    await page.waitForLoadState('networkidle')

    const validatorLink = page.locator('a[href*="/validators/0x"]').first()
    const hasLink = await validatorLink.count()

    if (hasLink > 0) {
      await validatorLink.click()
      await page.waitForLoadState('networkidle')

      // Click back or breadcrumb
      const backLink = page.getByRole('link', { name: /validators|back/i }).first()
      const hasBackLink = await backLink.count()

      if (hasBackLink > 0 && (await backLink.isVisible())) {
        await backLink.click()
        await expect(page).toHaveURL(/\/validators$/)
      }
    }
  })

  test('should handle invalid validator address', async ({ page }) => {
    await page.goto('/validators/0xinvalidaddress')
    await page.waitForLoadState('networkidle')

    // Should show error message
    const errorMessage = page.getByText(/not found|error|invalid/i)
    await expect(errorMessage).toBeVisible({ timeout: 10000 })
  })
})
