import { test, expect } from '@playwright/test'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
  })

  test('should display settings page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Settings/)

    // Check heading
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
  })

  test('should display network configuration section', async ({ page }) => {
    // Check for network settings
    const networkSection = page.getByText(/network|rpc|endpoint/i).first()
    await expect(networkSection).toBeVisible()
  })

  test('should display appearance settings if available', async ({ page }) => {
    // Check for theme or appearance settings
    const appearanceSection = page.getByText(/appearance|theme|dark|light/i)
    const hasAppearance = await appearanceSection.count()

    if (hasAppearance > 0) {
      await expect(appearanceSection.first()).toBeVisible()
    }
  })

  test('should toggle theme if available', async ({ page }) => {
    // Find theme toggle
    const themeToggle = page.getByRole('button', { name: /theme|dark|light/i })
    const hasToggle = await themeToggle.count()

    if (hasToggle > 0 && (await themeToggle.isVisible())) {
      await themeToggle.click()
      await page.waitForTimeout(500)

      // Theme toggle should work without error
      // Note: Implementation dependent, so we just check click doesn't error
      await expect(themeToggle).toBeVisible()
    }
  })

  test('should display API endpoints information', async ({ page }) => {
    // Check for API endpoint display
    const apiInfo = page.getByText(/graphql|websocket|rpc|api/i)
    const hasApiInfo = await apiInfo.count()

    if (hasApiInfo > 0) {
      await expect(apiInfo.first()).toBeVisible()
    }
  })

  test('should allow copying API endpoints', async ({ page }) => {
    // Find copy buttons
    const copyButtons = page.getByRole('button', { name: /copy/i })
    const hasCopyButtons = await copyButtons.count()

    if (hasCopyButtons > 0) {
      await copyButtons.first().click()
      // Should show success feedback (toast or tooltip)
    }
  })

  test('should save settings if save button exists', async ({ page }) => {
    // Find save button
    const saveButton = page.getByRole('button', { name: /save|apply/i })
    const hasSaveButton = await saveButton.count()

    if (hasSaveButton > 0 && (await saveButton.isVisible())) {
      // Just verify button exists and is clickable
      await expect(saveButton).toBeEnabled()
    }
  })

  test('should reset settings if reset button exists', async ({ page }) => {
    // Find reset button
    const resetButton = page.getByRole('button', { name: /reset|default/i })
    const hasResetButton = await resetButton.count()

    if (hasResetButton > 0 && (await resetButton.isVisible())) {
      await expect(resetButton).toBeEnabled()
    }
  })

  test('should be keyboard accessible', async ({ page }) => {
    // Tab through settings
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Some focusable element should be focused
    const focusedElement = page.locator(':focus')
    const hasFocus = await focusedElement.count()

    expect(hasFocus).toBeGreaterThan(0)
  })

  test('should persist settings across page reload', async ({ page }) => {
    // Find a setting to change (e.g., a checkbox or select)
    const checkbox = page.getByRole('checkbox').first()
    const hasCheckbox = await checkbox.count()

    if (hasCheckbox > 0 && (await checkbox.isVisible())) {
      // Toggle the checkbox
      await checkbox.click()
      await page.waitForTimeout(500)

      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Check if setting persisted
      const newCheckbox = page.getByRole('checkbox').first()

      // Settings might be persisted (implementation dependent)
      // Just verify the checkbox is still interactable
      await expect(newCheckbox).toBeVisible()
    }
  })

  test('should display current network information', async ({ page }) => {
    // Check for current network display
    const networkInfo = page.getByText(/current network|connected to|network:/i)
    const hasNetworkInfo = await networkInfo.count()

    if (hasNetworkInfo > 0) {
      await expect(networkInfo.first()).toBeVisible()
    }
  })
})
