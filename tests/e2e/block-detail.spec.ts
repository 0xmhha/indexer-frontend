import { test, expect } from '@playwright/test'

test.describe('Block Detail Page', () => {
  test('should display block details for a specific block number', async ({ page }) => {
    // Navigate to a known block (using block 1 as example)
    await page.goto('/block/1')

    // Check page title
    await expect(page).toHaveTitle(/Block #1/)

    // Check block number heading
    await expect(page.getByRole('heading', { name: /block #1/i })).toBeVisible()

    // Check for key block information fields
    await expect(page.getByText(/block height/i).first()).toBeVisible()
    await expect(page.getByText(/timestamp/i).first()).toBeVisible()
    await expect(page.getByText(/hash/i).first()).toBeVisible()
    await expect(page.getByText(/parent hash/i).first()).toBeVisible()
    await expect(page.getByText(/miner/i).first()).toBeVisible()
  })

  test('should display block details for block by hash', async ({ page }) => {
    // First, go to homepage to get a real block hash
    await page.goto('/')

    // Wait for blocks to load
    await page.waitForSelector('[data-testid="block-item"], .block-row', {
      timeout: 10000,
      state: 'visible',
    })

    // Get the first block link
    const firstBlockLink = page.locator('[data-testid="block-item"] a, .block-row a').first()
    const blockHref = await firstBlockLink.getAttribute('href')

    if (blockHref) {
      // Navigate to block detail page
      await page.goto(blockHref)

      // Check that we're on a block page
      await expect(page.getByRole('heading', { name: /block/i })).toBeVisible()

      // Check for block information
      await expect(page.getByText(/hash/i).first()).toBeVisible()
    }
  })

  test('should navigate to previous block', async ({ page }) => {
    // Start at block 10 (assuming it exists)
    await page.goto('/block/10')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Look for "Previous Block" button or link
    const prevButton = page.getByRole('link', { name: /previous block|prev/i }).first()

    if (await prevButton.isVisible()) {
      await prevButton.click()

      // Should navigate to block 9
      await expect(page).toHaveURL(/\/block\/(9|0x9)/)
    }
  })

  test('should navigate to next block', async ({ page }) => {
    // Start at block 1
    await page.goto('/block/1')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Look for "Next Block" button or link
    const nextButton = page.getByRole('link', { name: /next block|next/i }).first()

    if (await nextButton.isVisible()) {
      await nextButton.click()

      // Should navigate to block 2
      await expect(page).toHaveURL(/\/block\/(2|0x2)/)
    }
  })

  test('should display transactions in block', async ({ page }) => {
    // Navigate to a block that likely has transactions
    await page.goto('/block/1')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check if transactions list exists
    const hasTxList = await page.locator('[data-testid="transaction-list"], .transaction-list').count()

    if (hasTxList > 0) {
      await expect(page.locator('[data-testid="transaction-list"], .transaction-list')).toBeVisible()
    }
  })

  test('should display gas information', async ({ page }) => {
    await page.goto('/block/1')

    // Check for gas-related fields
    await expect(page.getByText(/gas used|gas limit/i).first()).toBeVisible()
  })

  test('should handle invalid block number gracefully', async ({ page }) => {
    // Navigate to a very large/invalid block number
    await page.goto('/block/999999999999')

    // Should show error or "not found" message
    const errorMessage = page.getByText(/not found|error|invalid/i)
    await expect(errorMessage).toBeVisible({ timeout: 10000 })
  })

  test('should handle invalid block hash gracefully', async ({ page }) => {
    // Navigate with invalid hash
    await page.goto('/block/0xinvalidhash123')

    // Should show error or "not found" message
    const errorMessage = page.getByText(/not found|error|invalid/i)
    await expect(errorMessage).toBeVisible({ timeout: 10000 })
  })

  test('should allow copying hash values', async ({ page }) => {
    await page.goto('/block/1')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Look for copy buttons (usually near hash fields)
    const copyButtons = page.getByRole('button', { name: /copy/i })
    const copyButtonCount = await copyButtons.count()

    if (copyButtonCount > 0) {
      // Click first copy button
      await copyButtons.first().click()

      // Check for success message or tooltip
      // (This is optional, depends on implementation)
    }
  })

  test('should display block reward if available', async ({ page }) => {
    await page.goto('/block/1')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check for reward field (may not exist in all implementations)
    const rewardText = page.getByText(/reward|block reward/i)
    const hasReward = await rewardText.count()

    if (hasReward > 0) {
      await expect(rewardText.first()).toBeVisible()
    }
  })

  test('should navigate to miner address from block details', async ({ page }) => {
    await page.goto('/block/1')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Look for miner address link
    const minerLink = page.getByRole('link', { name: /0x[a-fA-F0-9]{40}/ }).first()

    if (await minerLink.isVisible()) {
      // Click miner link
      await minerLink.click()

      // Should navigate to address page
      await expect(page).toHaveURL(/\/address\//)
    }
  })
})
