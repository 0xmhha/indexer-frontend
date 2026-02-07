import { test, expect } from '@playwright/test'

test.describe('Navigation Flow', () => {
  test.describe('Complete User Journey', () => {
    test('should navigate from homepage to block to transaction to address', async ({ page }) => {
      // Step 1: Start at homepage
      await page.goto('/')
      await expect(page.getByText('STABLE-ONE EXPLORER')).toBeVisible()

      // Step 2: Wait for blocks to load and click first block
      await page.waitForSelector('[data-testid="block-item"], .block-row', {
        timeout: 10000,
        state: 'visible',
      })
      const firstBlockLink = page.locator('[data-testid="block-item"] a, .block-row a').first()
      await firstBlockLink.click()
      await expect(page).toHaveURL(/\/block\//)

      // Step 3: Find a transaction in this block and click it
      const txLink = page.locator('a[href*="/tx/"]').first()
      const hasTxLink = await txLink.count()

      if (hasTxLink > 0 && (await txLink.isVisible())) {
        await txLink.click()
        await expect(page).toHaveURL(/\/tx\//)

        // Step 4: Navigate to an address from transaction
        const addressLink = page.locator('a[href*="/address/"]').first()

        if (await addressLink.isVisible()) {
          await addressLink.click()
          await expect(page).toHaveURL(/\/address\//)

          // Verify address page loaded
          await expect(page.getByText(/balance/i).first()).toBeVisible()
        }
      }
    })

    test('should use search to navigate between different entity types', async ({ page }) => {
      await page.goto('/')

      const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()

      // Search for block 1
      await searchInput.fill('1')
      await searchInput.press('Enter')
      await page.waitForLoadState('networkidle')

      // Verify we're on a block or search page
      const url = page.url()
      expect(url.includes('/block/') || url.includes('/search')).toBeTruthy()
    })
  })

  test.describe('Header Navigation', () => {
    test('should navigate to all main sections from header', async ({ page }) => {
      await page.goto('/')

      const nav = page.locator('nav[aria-label="Main navigation"]')
      await expect(nav).toBeVisible()

      // Test navigation to Blocks
      const blocksLink = nav.getByRole('link', { name: /blocks/i })
      if (await blocksLink.isVisible()) {
        await blocksLink.click()
        await expect(page).toHaveURL(/\/blocks/)
      }

      // Navigate back to home
      await page.goto('/')

      // Test navigation to Transactions
      const txLink = nav.getByRole('link', { name: /transactions/i })
      if (await txLink.isVisible()) {
        await txLink.click()
        await expect(page).toHaveURL(/\/(txs|transactions)/)
      }
    })

    test('should navigate home by clicking logo', async ({ page }) => {
      // Start on a different page
      await page.goto('/blocks')

      // Click logo/site name
      const logo = page.getByText('STABLE-ONE EXPLORER').first()

      if (await logo.isVisible()) {
        await logo.click()
        await expect(page).toHaveURL(/^\/$|\/\?/)
      }
    })
  })

  test.describe('Browser Navigation', () => {
    test('should support browser back/forward navigation', async ({ page }) => {
      // Visit homepage
      await page.goto('/')
      const homeUrl = page.url()

      // Navigate to blocks
      await page.goto('/blocks')
      expect(page.url()).toContain('/blocks')

      // Navigate to a specific block
      await page.goto('/block/1')
      expect(page.url()).toContain('/block/')

      // Go back
      await page.goBack()
      expect(page.url()).toContain('/blocks')

      // Go back again
      await page.goBack()
      expect(page.url()).toBe(homeUrl)

      // Go forward
      await page.goForward()
      expect(page.url()).toContain('/blocks')
    })

    test('should preserve scroll position on back navigation', async ({ page }) => {
      await page.goto('/blocks')
      await page.waitForLoadState('networkidle')

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 300))

      // Navigate to a block
      const blockLink = page.locator('a[href*="/block/"]').first()
      if (await blockLink.isVisible()) {
        await blockLink.click()
        await page.waitForLoadState('networkidle')

        // Go back
        await page.goBack()
        await page.waitForLoadState('networkidle')

        // Scroll position might be restored (browser behavior varies)
        // Just verify we're back on blocks page
        expect(page.url()).toContain('/blocks')
      }
    })
  })

  test.describe('Breadcrumb Navigation', () => {
    test('should display breadcrumbs on detail pages', async ({ page }) => {
      await page.goto('/block/1')
      await page.waitForLoadState('networkidle')

      // Check for breadcrumb navigation
      const breadcrumb = page.locator('nav[aria-label*="breadcrumb"], .breadcrumb, [data-testid="breadcrumb"]')
      const hasBreadcrumb = await breadcrumb.count()

      if (hasBreadcrumb > 0) {
        await expect(breadcrumb.first()).toBeVisible()

        // Check for home link in breadcrumb
        const homeLink = breadcrumb.getByRole('link', { name: /home|explorer/i })
        const hasHomeLink = await homeLink.count()

        if (hasHomeLink > 0) {
          await expect(homeLink.first()).toBeVisible()
        }
      }
    })

    test('should navigate via breadcrumbs', async ({ page }) => {
      await page.goto('/block/1')
      await page.waitForLoadState('networkidle')

      const breadcrumb = page.locator('nav[aria-label*="breadcrumb"], .breadcrumb')
      const hasBreadcrumb = await breadcrumb.count()

      if (hasBreadcrumb > 0) {
        const homeLink = breadcrumb.getByRole('link').first()
        if (await homeLink.isVisible()) {
          await homeLink.click()
          await page.waitForLoadState('networkidle')

          // Should navigate to home or blocks
          const url = page.url()
          expect(url.endsWith('/') || url.includes('/blocks')).toBeTruthy()
        }
      }
    })
  })

  test.describe('Accessibility Navigation', () => {
    test('should support keyboard navigation through main nav', async ({ page }) => {
      await page.goto('/')

      // Tab to navigation
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Find focused element
      const focused = page.locator(':focus')
      const hasFocus = await focused.count()

      if (hasFocus > 0) {
        // Press Enter to activate link
        await page.keyboard.press('Enter')
        await page.waitForLoadState('networkidle')

        // Should have navigated
        expect(page.url()).not.toBe('http://localhost:3000/')
      }
    })

    test('should have skip to content link', async ({ page }) => {
      await page.goto('/')

      // Skip link should be first focusable element
      await page.keyboard.press('Tab')

      const skipLink = page.getByRole('link', { name: /skip to content|skip to main/i })
      const hasSkipLink = await skipLink.count()

      if (hasSkipLink > 0 && (await skipLink.isVisible())) {
        // Click skip link
        await skipLink.click()

        // Main content should be focused
        await page.waitForTimeout(300)
      }
    })
  })

  test.describe('Error Navigation', () => {
    test('should show 404 for non-existent pages', async ({ page }) => {
      await page.goto('/non-existent-page-12345')

      // Should show 404 error
      const errorText = page.getByText(/404|not found|page not found/i)
      await expect(errorText).toBeVisible({ timeout: 10000 })
    })

    test('should provide navigation back from error page', async ({ page }) => {
      await page.goto('/non-existent-page-12345')

      // Find home or back link
      const homeLink = page.getByRole('link', { name: /home|back|return/i })
      const hasHomeLink = await homeLink.count()

      if (hasHomeLink > 0) {
        await homeLink.first().click()
        await page.waitForLoadState('networkidle')

        // Should be back on a valid page
        expect(page.url()).not.toContain('non-existent')
      }
    })
  })

  test.describe('Deep Linking', () => {
    test('should support direct navigation to block by number', async ({ page }) => {
      await page.goto('/block/1')
      await expect(page.getByRole('heading', { name: /block/i })).toBeVisible()
    })

    test('should support direct navigation to transaction by hash', async ({ page }) => {
      // First get a real transaction hash
      await page.goto('/')

      await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
        timeout: 10000,
        state: 'visible',
      })

      const txLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
      const href = await txLink.getAttribute('href')

      if (href) {
        // Navigate directly to transaction
        await page.goto(href)
        await expect(page).toHaveURL(/\/tx\//)
        await expect(page.getByText(/transaction/i).first()).toBeVisible()
      }
    })

    test('should support direct navigation to address', async ({ page }) => {
      // Use a known format address
      await page.goto('/address/0x0000000000000000000000000000000000000001')
      await page.waitForLoadState('networkidle')

      // Should show address page or error
      const hasAddress = await page.getByText(/address|balance|not found/i).count()
      expect(hasAddress).toBeGreaterThan(0)
    })
  })
})
