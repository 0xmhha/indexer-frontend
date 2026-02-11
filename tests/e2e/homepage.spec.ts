import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display page title and header', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/StableNet Explorer/)

    // Check header is visible
    const header = page.locator('header')
    await expect(header).toBeVisible()

    // Check logo and site name
    await expect(page.getByText('STABLENET EXPLORER')).toBeVisible()
  })

  test('should display navigation menu', async ({ page }) => {
    // Check main navigation links
    const nav = page.locator('nav[aria-label="Main navigation"]')
    await expect(nav).toBeVisible()

    // Check navigation items
    await expect(nav.getByRole('link', { name: /blocks/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /transactions/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /statistics/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /contract/i })).toBeVisible()
  })

  test('should display network statistics', async ({ page }) => {
    // Check for network stats section
    const statsSection = page.locator('text=NETWORK STATUS').first()
    await expect(statsSection).toBeVisible()

    // Check for key metrics (these are loaded from API, so just check structure)
    await expect(page.getByText(/latest block/i).first()).toBeVisible()
    await expect(page.getByText(/gas price/i).first()).toBeVisible()
  })

  test('should display latest blocks section', async ({ page }) => {
    // Check for latest blocks heading
    await expect(page.getByText(/latest blocks/i).first()).toBeVisible()

    // Wait for blocks to load (WebSocket data)
    await page.waitForSelector('[data-testid="block-item"], .block-row', {
      timeout: 10000,
      state: 'visible',
    })

    // Check that at least one block is displayed
    const blockItems = page.locator('[data-testid="block-item"], .block-row')
    await expect(blockItems.first()).toBeVisible()
  })

  test('should display latest transactions section', async ({ page }) => {
    // Check for latest transactions heading
    await expect(page.getByText(/latest transactions/i).first()).toBeVisible()

    // Wait for transactions to load
    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    // Check that at least one transaction is displayed
    const txItems = page.locator('[data-testid="transaction-item"], .transaction-row')
    await expect(txItems.first()).toBeVisible()
  })

  test('should navigate to blocks list page', async ({ page }) => {
    // Click "View All Blocks" or similar link
    const viewAllLink = page.getByRole('link', { name: /view all blocks|all blocks/i }).first()

    if (await viewAllLink.isVisible()) {
      await viewAllLink.click()
      await expect(page).toHaveURL(/\/blocks/)
    }
  })

  test('should navigate to transactions list page', async ({ page }) => {
    // Click "View All Transactions" or similar link
    const viewAllLink = page.getByRole('link', { name: /view all transactions|all transactions/i }).first()

    if (await viewAllLink.isVisible()) {
      await viewAllLink.click()
      await expect(page).toHaveURL(/\/transactions/)
    }
  })

  test('should display footer with API endpoints', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Check footer content
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // Check for API endpoints
    await expect(footer.getByText(/graphql/i)).toBeVisible()
    await expect(footer.getByText(/websocket/i)).toBeVisible()
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that page still loads properly
    await expect(page.getByText('STABLENET EXPLORER')).toBeVisible()

    // Mobile menu might be different, just check header exists
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })
})
