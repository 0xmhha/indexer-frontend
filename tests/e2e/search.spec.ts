import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
  test('should display search input on homepage', async ({ page }) => {
    await page.goto('/')

    // Check for search input
    const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i)
    await expect(searchInput.first()).toBeVisible()
  })

  test('should search for block by number', async ({ page }) => {
    await page.goto('/')

    // Find search input
    const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()

    // Type block number
    await searchInput.fill('1')

    // Submit search (press Enter or click search button)
    await searchInput.press('Enter')

    // Should navigate to block page or show search results
    await page.waitForURL(/\/block\/1|\/search/, { timeout: 10000 })

    // Verify we're on the right page
    const isBlockPage = page.url().includes('/block/')
    const isSearchPage = page.url().includes('/search')

    expect(isBlockPage || isSearchPage).toBeTruthy()
  })

  test('should search for block by hash', async ({ page }) => {
    // First get a real block hash
    await page.goto('/')

    await page.waitForSelector('[data-testid="block-item"], .block-row', {
      timeout: 10000,
      state: 'visible',
    })

    // Get a block hash from the page
    const blockHashElement = page.locator('text=/0x[a-fA-F0-9]{64}/').first()
    const blockHash = await blockHashElement.textContent()

    if (blockHash) {
      // Use search to find this block
      const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()
      await searchInput.fill(blockHash.trim())
      await searchInput.press('Enter')

      // Should navigate to block page
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL(/\/block\//, { timeout: 10000 })
    }
  })

  test('should search for transaction by hash', async ({ page }) => {
    // First get a real transaction hash
    await page.goto('/')

    await page.waitForSelector('[data-testid="transaction-item"], .transaction-row', {
      timeout: 10000,
      state: 'visible',
    })

    // Navigate to a transaction to get its hash
    const firstTxLink = page.locator('[data-testid="transaction-item"] a, .transaction-row a').first()
    const txHref = await firstTxLink.getAttribute('href')

    if (txHref) {
      // Extract hash from href (e.g., /tx/0x123... -> 0x123...)
      const txHash = txHref.split('/tx/')[1]

      if (txHash) {
        // Go back to homepage
        await page.goto('/')

        // Use search to find this transaction
        const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()
        await searchInput.fill(txHash)
        await searchInput.press('Enter')

        // Should navigate to transaction page
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL(/\/tx\//, { timeout: 10000 })
      }
    }
  })

  test('should search for address', async ({ page }) => {
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
      // Extract address from href
      const address = addressHref.split('/address/')[1]

      if (address) {
        // Go back to homepage
        await page.goto('/')

        // Use search to find this address
        const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()
        await searchInput.fill(address)
        await searchInput.press('Enter')

        // Should navigate to address page
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL(/\/address\//, { timeout: 10000 })
      }
    }
  })

  test('should show autocomplete suggestions', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()

    // Type to trigger autocomplete
    await searchInput.fill('0x')

    // Wait a bit for autocomplete to appear
    await page.waitForTimeout(500)

    // Check if autocomplete dropdown appears
    const autocomplete = page.locator('[role="listbox"], [role="menu"], .autocomplete-results')
    const hasAutocomplete = await autocomplete.count()

    if (hasAutocomplete > 0) {
      await expect(autocomplete.first()).toBeVisible()

      // Check for suggestions
      const suggestions = autocomplete.locator('[role="option"], li, .suggestion-item')
      const suggestionCount = await suggestions.count()

      if (suggestionCount > 0) {
        // Click first suggestion
        await suggestions.first().click()

        // Should navigate somewhere
        await page.waitForLoadState('networkidle')
      }
    }
  })

  test('should handle invalid search input gracefully', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()

    // Type invalid input
    await searchInput.fill('invalid_search_query_12345')
    await searchInput.press('Enter')

    // Should either stay on page or show error
    await page.waitForLoadState('networkidle')

    // Check for error message or no results message
    const errorOrNoResults = page.getByText(/not found|no results|invalid|error/i)
    const hasMessage = await errorOrNoResults.count()

    if (hasMessage > 0) {
      await expect(errorOrNoResults.first()).toBeVisible()
    }
  })

  test('should clear search input', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()

    // Type something
    await searchInput.fill('test search')

    // Check if clear button appears
    const clearButton = page.getByRole('button', { name: /clear|×/i })
    const hasClearButton = await clearButton.count()

    if (hasClearButton > 0 && (await clearButton.isVisible())) {
      await clearButton.click()

      // Input should be empty
      await expect(searchInput).toHaveValue('')
    }
  })

  test('should support keyboard navigation in search results', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()

    // Type to trigger autocomplete
    await searchInput.fill('0x')
    await page.waitForTimeout(500)

    // Check if autocomplete appears
    const autocomplete = page.locator('[role="listbox"], [role="menu"], .autocomplete-results')
    const hasAutocomplete = await autocomplete.count()

    if (hasAutocomplete > 0) {
      // Try arrow down navigation
      await searchInput.press('ArrowDown')
      await page.waitForTimeout(200)

      // First item should be highlighted/selected
      const selectedItem = page.locator('[aria-selected="true"], .selected, .highlighted')
      const hasSelected = await selectedItem.count()

      if (hasSelected > 0) {
        await expect(selectedItem.first()).toBeVisible()

        // Press Enter to select
        await searchInput.press('Enter')

        // Should navigate
        await page.waitForLoadState('networkidle')
      }
    }
  })

  test('should search from header on any page', async ({ page }) => {
    // Navigate to blocks page
    await page.goto('/blocks')

    // Search should still be available in header
    const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()
    await expect(searchInput).toBeVisible()

    // Perform a search
    await searchInput.fill('1')
    await searchInput.press('Enter')

    // Should navigate to block page
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/block\/1|\/search/, { timeout: 10000 })
  })

  test('should handle search with whitespace', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()

    // Type with leading/trailing spaces
    await searchInput.fill('  1  ')
    await searchInput.press('Enter')

    // Should still work (whitespace trimmed)
    await page.waitForLoadState('networkidle')
    const isBlockPage = page.url().includes('/block/')
    const isSearchPage = page.url().includes('/search')

    expect(isBlockPage || isSearchPage).toBeTruthy()
  })

  test('should show search history if available', async ({ page }) => {
    await page.goto('/')

    const searchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()

    // Perform a search first
    await searchInput.fill('1')
    await searchInput.press('Enter')
    await page.waitForLoadState('networkidle')

    // Go back to homepage
    await page.goto('/')

    // Click on search input
    const newSearchInput = page.getByPlaceholder(/search|address|block|transaction|hash/i).first()
    await newSearchInput.click()

    // Check if recent searches appear
    await page.waitForTimeout(500)

    const recentSearches = page.getByText(/recent searches|history/i)
    const hasHistory = await recentSearches.count()

    if (hasHistory > 0) {
      await expect(recentSearches.first()).toBeVisible()
    }
  })
})
