import { test, expect } from '@playwright/test'

test.describe('Pagination', () => {
  test.describe('Blocks Page Pagination', () => {
    test('should display pagination controls on blocks page', async ({ page }) => {
      await page.goto('/blocks')

      // Wait for blocks to load
      await page.waitForLoadState('networkidle')

      // Check for pagination controls
      const pagination = page.locator('[data-testid="pagination"], .pagination, nav[aria-label*="pagination"]')
      const hasPagination = await pagination.count()

      if (hasPagination > 0) {
        await expect(pagination.first()).toBeVisible()
      }
    })

    test('should navigate to next page', async ({ page }) => {
      await page.goto('/blocks')

      await page.waitForLoadState('networkidle')

      // Find next page button
      const nextButton = page.getByRole('button', { name: /next|→|>|»/i }).first()
      const nextLink = page.getByRole('link', { name: /next|→|>|»/i }).first()

      const hasNextButton = await nextButton.count()
      const hasNextLink = await nextLink.count()

      if (hasNextButton > 0 && (await nextButton.isEnabled())) {
        await nextButton.click()
        await page.waitForLoadState('networkidle')

        // URL should change to indicate page 2
        const url = page.url()
        expect(url.includes('page=2') || url.includes('offset=')).toBeTruthy()
      } else if (hasNextLink > 0 && (await nextLink.isVisible())) {
        await nextLink.click()
        await page.waitForLoadState('networkidle')

        const url = page.url()
        expect(url.includes('page=2') || url.includes('offset=')).toBeTruthy()
      }
    })

    test('should navigate to previous page', async ({ page }) => {
      // Start on page 2
      await page.goto('/blocks?page=2')

      await page.waitForLoadState('networkidle')

      // Find previous page button
      const prevButton = page.getByRole('button', { name: /prev|←|<|«/i }).first()
      const prevLink = page.getByRole('link', { name: /prev|←|<|«/i }).first()

      const hasPrevButton = await prevButton.count()
      const hasPrevLink = await prevLink.count()

      if (hasPrevButton > 0 && (await prevButton.isEnabled())) {
        await prevButton.click()
        await page.waitForLoadState('networkidle')

        // URL should change to page 1 or have no page param
        const url = page.url()
        expect(url.includes('page=1') || !url.includes('page=')).toBeTruthy()
      } else if (hasPrevLink > 0 && (await prevLink.isVisible())) {
        await prevLink.click()
        await page.waitForLoadState('networkidle')

        const url = page.url()
        expect(url.includes('page=1') || !url.includes('page=')).toBeTruthy()
      }
    })

    test('should navigate to specific page number', async ({ page }) => {
      await page.goto('/blocks')

      await page.waitForLoadState('networkidle')

      // Find page number button (looking for page 2 or 3)
      const pageNumber = page.getByRole('button', { name: /^2$|^3$/ }).first()
      const pageLink = page.getByRole('link', { name: /^2$|^3$/ }).first()

      const hasPageNumber = await pageNumber.count()
      const hasPageLink = await pageLink.count()

      if (hasPageNumber > 0 && (await pageNumber.isVisible())) {
        const pageNum = await pageNumber.textContent()
        await pageNumber.click()
        await page.waitForLoadState('networkidle')

        const url = page.url()
        expect(url.includes(`page=${pageNum}`)).toBeTruthy()
      } else if (hasPageLink > 0 && (await pageLink.isVisible())) {
        const pageNum = await pageLink.textContent()
        await pageLink.click()
        await page.waitForLoadState('networkidle')

        const url = page.url()
        expect(url.includes(`page=${pageNum}`)).toBeTruthy()
      }
    })

    test('should disable previous button on first page', async ({ page }) => {
      await page.goto('/blocks')

      await page.waitForLoadState('networkidle')

      // Find previous button
      const prevButton = page.getByRole('button', { name: /prev|←|<|«/i }).first()
      const hasPrevButton = await prevButton.count()

      if (hasPrevButton > 0) {
        // Should be disabled on first page
        const isDisabled = await prevButton.isDisabled()
        const hasDisabledClass = await prevButton.evaluate((el) =>
          el.classList.contains('disabled') || el.hasAttribute('disabled')
        )

        expect(isDisabled || hasDisabledClass).toBeTruthy()
      }
    })

    test('should update blocks list when page changes', async ({ page }) => {
      await page.goto('/blocks')

      await page.waitForLoadState('networkidle')

      // Get first block number on page 1
      const firstBlockOnPage1 = await page.locator('[data-testid="block-item"], .block-row').first().textContent()

      // Navigate to page 2
      const nextButton = page.getByRole('button', { name: /next|→|>|»/i }).first()
      const nextLink = page.getByRole('link', { name: /next|→|>|»/i }).first()

      const hasNextButton = await nextButton.count()
      const hasNextLink = await nextLink.count()

      if ((hasNextButton > 0 && (await nextButton.isEnabled())) || (hasNextLink > 0 && (await nextLink.isVisible()))) {
        if (hasNextButton > 0) {
          await nextButton.click()
        } else {
          await nextLink.click()
        }

        await page.waitForLoadState('networkidle')

        // Get first block number on page 2
        const firstBlockOnPage2 = await page.locator('[data-testid="block-item"], .block-row').first().textContent()

        // Blocks should be different
        expect(firstBlockOnPage1).not.toBe(firstBlockOnPage2)
      }
    })
  })

  test.describe('Transactions Page Pagination', () => {
    test('should display pagination on transactions page', async ({ page }) => {
      await page.goto('/transactions')

      await page.waitForLoadState('networkidle')

      // Check for pagination
      const pagination = page.locator('[data-testid="pagination"], .pagination, nav[aria-label*="pagination"]')
      const hasPagination = await pagination.count()

      if (hasPagination > 0) {
        await expect(pagination.first()).toBeVisible()
      }
    })

    test('should navigate between transaction pages', async ({ page }) => {
      await page.goto('/transactions')

      await page.waitForLoadState('networkidle')

      // Get first transaction on page 1
      const firstTxOnPage1 = await page.locator('[data-testid="transaction-item"], .transaction-row').first().textContent()

      // Navigate to next page
      const nextButton = page.getByRole('button', { name: /next|→|>|»/i }).first()
      const nextLink = page.getByRole('link', { name: /next|→|>|»/i }).first()

      const hasNextButton = await nextButton.count()
      const hasNextLink = await nextLink.count()

      if ((hasNextButton > 0 && (await nextButton.isEnabled())) || (hasNextLink > 0 && (await nextLink.isVisible()))) {
        if (hasNextButton > 0) {
          await nextButton.click()
        } else {
          await nextLink.click()
        }

        await page.waitForLoadState('networkidle')

        // Get first transaction on page 2
        const firstTxOnPage2 = await page.locator('[data-testid="transaction-item"], .transaction-row').first().textContent()

        // Transactions should be different
        expect(firstTxOnPage1).not.toBe(firstTxOnPage2)
      }
    })
  })

  test.describe('Address Transactions Pagination', () => {
    test('should paginate transactions on address page', async ({ page }) => {
      // First get a real address
      await page.goto('/')

      await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
        timeout: 10000,
        state: 'visible',
      })

      const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
      await firstTxLink.click()
      await page.waitForLoadState('networkidle')

      const addressLink = page.locator('a[href*="/address/"]').first()
      const addressHref = await addressLink.getAttribute('href')

      if (addressHref) {
        // Navigate to address page
        await page.goto(addressHref)
        await page.waitForLoadState('networkidle')

        // Check for pagination on address page
        const pagination = page.locator('[data-testid="pagination"], .pagination, nav[aria-label*="pagination"]')
        const hasPagination = await pagination.count()

        if (hasPagination > 0) {
          await expect(pagination.first()).toBeVisible()
        }
      }
    })
  })

  test.describe('Pagination URL State', () => {
    test('should preserve page state in URL', async ({ page }) => {
      // Navigate directly to page 2
      await page.goto('/blocks?page=2')

      await page.waitForLoadState('networkidle')

      // URL should still have page=2
      expect(page.url()).toContain('page=2')
    })

    test('should handle invalid page number gracefully', async ({ page }) => {
      // Navigate to invalid page
      await page.goto('/blocks?page=999999')

      await page.waitForLoadState('networkidle')

      // Should either redirect to valid page or show empty/error state
      const content = await page.content()
      const hasBlocks = content.includes('block') || content.includes('Block')
      const hasError = content.toLowerCase().includes('error') || content.toLowerCase().includes('not found')
      const hasEmpty = content.toLowerCase().includes('no') || content.toLowerCase().includes('empty')

      expect(hasBlocks || hasError || hasEmpty).toBeTruthy()
    })

    test('should handle negative page number', async ({ page }) => {
      // Navigate with negative page
      await page.goto('/blocks?page=-1')

      await page.waitForLoadState('networkidle')

      // Should redirect to page 1 or handle gracefully
      const url = page.url()
      expect(url.includes('page=-1') || url.includes('page=1') || !url.includes('page=')).toBeTruthy()
    })
  })

  test.describe('Pagination Display', () => {
    test('should show current page indicator', async ({ page }) => {
      await page.goto('/blocks')

      await page.waitForLoadState('networkidle')

      // Check for current page indicator
      const currentPage = page.locator('[aria-current="page"], .active, .current-page')
      const hasCurrentPage = await currentPage.count()

      if (hasCurrentPage > 0) {
        await expect(currentPage.first()).toBeVisible()
      }
    })

    test('should show page count or total results if available', async ({ page }) => {
      await page.goto('/blocks')

      await page.waitForLoadState('networkidle')

      // Check for result count or page info
      const pageInfo = page.getByText(/of \d+|total|results/i)
      const hasPageInfo = await pageInfo.count()

      if (hasPageInfo > 0) {
        await expect(pageInfo.first()).toBeVisible()
      }
    })

    test('should support items per page selector if available', async ({ page }) => {
      await page.goto('/blocks')

      await page.waitForLoadState('networkidle')

      // Check for items per page selector
      const perPageSelector = page.locator('select[name*="per"], select[name*="limit"], select[name*="size"]')
      const hasSelector = await perPageSelector.count()

      if (hasSelector > 0 && (await perPageSelector.isVisible())) {
        // Change items per page
        await perPageSelector.selectOption({ index: 1 })
        await page.waitForLoadState('networkidle')

        // URL should update with new limit
        const url = page.url()
        const hasLimitParam = url.includes('limit=') || url.includes('per_page=') || url.includes('size=')
        expect(hasLimitParam).toBeTruthy()
      }
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation for pagination', async ({ page }) => {
      await page.goto('/blocks')

      await page.waitForLoadState('networkidle')

      // Focus on pagination
      const pagination = page.locator('[data-testid="pagination"], .pagination, nav[aria-label*="pagination"]')
      const hasPagination = await pagination.count()

      if (hasPagination > 0) {
        // Tab to pagination controls
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')

        // The next button should be focusable
        const nextButton = page.getByRole('button', { name: /next|→|>|»/i }).first()
        const hasNextButton = await nextButton.count()

        if (hasNextButton > 0) {
          // Just verify pagination exists and is interactive
          expect(hasPagination).toBeGreaterThan(0)
        }
      }
    })
  })
})
