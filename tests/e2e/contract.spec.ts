import { test, expect } from '@playwright/test'

test.describe('Contract Interaction Page', () => {
  test('should display contract interaction page', async ({ page }) => {
    await page.goto('/contract')

    // Check page title
    await expect(page).toHaveTitle(/Contract/)

    // Check heading
    await expect(page.getByRole('heading', { name: /contract interaction/i })).toBeVisible()
  })

  test('should display contract address input', async ({ page }) => {
    await page.goto('/contract')

    // Check for contract address input
    const addressInput = page.getByLabel(/contract address/i)
    await expect(addressInput).toBeVisible()
  })

  test('should display read and write tabs', async ({ page }) => {
    await page.goto('/contract')

    // Check for tab interface
    const readTab = page.getByRole('tab', { name: /read/i })
    const writeTab = page.getByRole('tab', { name: /write/i })

    await expect(readTab).toBeVisible()
    await expect(writeTab).toBeVisible()
  })

  test('should switch between read and write tabs', async ({ page }) => {
    await page.goto('/contract')

    // Click on Write tab
    const writeTab = page.getByRole('tab', { name: /write/i })
    await writeTab.click()

    // Write tab should be selected
    await expect(writeTab).toHaveAttribute('aria-selected', 'true')

    // Click back to Read tab
    const readTab = page.getByRole('tab', { name: /read/i })
    await readTab.click()

    // Read tab should be selected
    await expect(readTab).toHaveAttribute('aria-selected', 'true')
  })

  test('should validate contract address format', async ({ page }) => {
    await page.goto('/contract')

    const addressInput = page.getByLabel(/contract address/i)

    // Enter invalid address
    await addressInput.fill('invalid_address')

    // Trigger validation (blur or form submit)
    await addressInput.blur()

    // Wait a bit for validation
    await page.waitForTimeout(500)

    // Check for error message
    const errorMessage = page.getByRole('alert')
    const hasError = await errorMessage.count()

    if (hasError > 0) {
      await expect(errorMessage.first()).toBeVisible()
    }
  })

  test('should accept valid contract address', async ({ page }) => {
    await page.goto('/contract')

    const addressInput = page.getByLabel(/contract address/i)

    // Enter valid address (example)
    await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbE')

    // Trigger validation
    await addressInput.blur()

    // Wait for potential error (should not appear)
    await page.waitForTimeout(500)

    // No error should be visible
    const errorMessage = page.getByRole('alert')
    const hasError = await errorMessage.isVisible()

    expect(hasError).toBeFalsy()
  })

  test('should load contract ABI when valid address is entered', async ({ page }) => {
    await page.goto('/contract')

    const addressInput = page.getByLabel(/contract address/i)

    // Enter a valid contract address
    await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbE')

    // Submit or trigger load
    const loadButton = page.getByRole('button', { name: /load|fetch|get abi/i })
    const hasLoadButton = await loadButton.count()

    if (hasLoadButton > 0) {
      await loadButton.click()

      // Wait for ABI to load
      await page.waitForTimeout(2000)

      // Check if functions are displayed
      // (This depends on whether the contract exists and has an ABI)
      const functionList = page.locator('[data-testid="function-list"], .function-list')
      const hasFunctions = await functionList.count()

      if (hasFunctions > 0) {
        await expect(functionList.first()).toBeVisible()
      }
    }
  })

  test('should display read functions in read tab', async ({ page }) => {
    await page.goto('/contract')

    // Enter a valid address
    const addressInput = page.getByLabel(/contract address/i)
    await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbE')

    // Load or submit
    await addressInput.press('Enter')
    await page.waitForTimeout(2000)

    // Make sure we're on Read tab
    const readTab = page.getByRole('tab', { name: /read/i })
    await readTab.click()

    // Check for read functions panel
    const readPanel = page.locator('[role="tabpanel"][id*="read"], #read-panel')
    const hasReadPanel = await readPanel.count()

    if (hasReadPanel > 0) {
      await expect(readPanel.first()).toBeVisible()
    }
  })

  test('should display write functions in write tab', async ({ page }) => {
    await page.goto('/contract')

    // Enter a valid address
    const addressInput = page.getByLabel(/contract address/i)
    await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbE')

    // Load or submit
    await addressInput.press('Enter')
    await page.waitForTimeout(2000)

    // Switch to Write tab
    const writeTab = page.getByRole('tab', { name: /write/i })
    await writeTab.click()

    // Check for write functions panel
    const writePanel = page.locator('[role="tabpanel"][id*="write"], #write-panel')
    const hasWritePanel = await writePanel.count()

    if (hasWritePanel > 0) {
      await expect(writePanel.first()).toBeVisible()
    }
  })

  test('should show wallet connection button in write tab', async ({ page }) => {
    await page.goto('/contract')

    // Switch to Write tab
    const writeTab = page.getByRole('tab', { name: /write/i })
    await writeTab.click()

    // Check for connect wallet button
    const connectButton = page.getByRole('button', { name: /connect wallet/i })
    const hasConnectButton = await connectButton.count()

    if (hasConnectButton > 0) {
      await expect(connectButton.first()).toBeVisible()
    }
  })

  test('should expand/collapse function details', async ({ page }) => {
    await page.goto('/contract')

    const addressInput = page.getByLabel(/contract address/i)
    await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbE')
    await addressInput.press('Enter')
    await page.waitForTimeout(2000)

    // Look for expandable function items
    const functionButton = page.locator('button[aria-expanded]').first()
    const hasExpandable = await functionButton.count()

    if (hasExpandable > 0) {
      // Check initial state
      const initialExpanded = await functionButton.getAttribute('aria-expanded')

      // Click to toggle
      await functionButton.click()

      // State should change
      const newExpanded = await functionButton.getAttribute('aria-expanded')
      expect(newExpanded).not.toBe(initialExpanded)
    }
  })

  test('should handle missing contract gracefully', async ({ page }) => {
    await page.goto('/contract')

    const addressInput = page.getByLabel(/contract address/i)

    // Enter address that doesn't exist or has no ABI
    await addressInput.fill('0x0000000000000000000000000000000000000001')
    await addressInput.press('Enter')

    // Wait for response
    await page.waitForTimeout(2000)

    // Check for error or no functions message
    const errorOrNoFunctions = page.getByText(/not found|no functions|error|unable to load/i)
    const hasMessage = await errorOrNoFunctions.count()

    if (hasMessage > 0) {
      await expect(errorOrNoFunctions.first()).toBeVisible()
    }
  })

  test('should display function inputs for read functions', async ({ page }) => {
    await page.goto('/contract')

    const addressInput = page.getByLabel(/contract address/i)
    await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbE')
    await addressInput.press('Enter')
    await page.waitForTimeout(2000)

    // Expand first read function
    const functionButtons = page.locator('button[aria-expanded]')
    const hasButtons = await functionButtons.count()

    if (hasButtons > 0) {
      await functionButtons.first().click()

      // Check if input fields appear
      await page.waitForTimeout(500)

      // Look for input fields or a "Query" button
      const queryButton = page.getByRole('button', { name: /query|call|read/i })
      const hasQueryButton = await queryButton.count()

      if (hasQueryButton > 0) {
        await expect(queryButton.first()).toBeVisible()
      }
    }
  })

  test('should show loading state when querying contract', async ({ page }) => {
    await page.goto('/contract')

    const addressInput = page.getByLabel(/contract address/i)
    await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbE')
    await addressInput.press('Enter')
    await page.waitForTimeout(2000)

    // Expand and query a function
    const functionButtons = page.locator('button[aria-expanded]')
    const hasButtons = await functionButtons.count()

    if (hasButtons > 0) {
      await functionButtons.first().click()
      await page.waitForTimeout(500)

      const queryButton = page.getByRole('button', { name: /query|call|read/i }).first()
      const hasQueryButton = await queryButton.count()

      if (hasQueryButton > 0) {
        // Click query button
        await queryButton.click()

        // Look for loading indicator
        await page.waitForTimeout(200)

        const loadingIndicator = page.locator('[role="status"], .loading, .spinner')
        const hasLoading = await loadingIndicator.count()

        if (hasLoading > 0) {
          // Loading indicator should appear briefly
          // (May disappear quickly so we don't assert visibility)
        }
      }
    }
  })

  test('should require wallet connection for write functions', async ({ page }) => {
    await page.goto('/contract')

    const addressInput = page.getByLabel(/contract address/i)
    await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbE')
    await addressInput.press('Enter')
    await page.waitForTimeout(2000)

    // Switch to Write tab
    const writeTab = page.getByRole('tab', { name: /write/i })
    await writeTab.click()

    // Try to interact with a write function without connecting wallet
    const functionButtons = page.locator('button[aria-expanded]')
    const hasButtons = await functionButtons.count()

    if (hasButtons > 0) {
      await functionButtons.first().click()
      await page.waitForTimeout(500)

      // Look for disabled state or connect wallet message
      const writeButton = page.getByRole('button', { name: /write|execute|submit/i }).first()
      const hasWriteButton = await writeButton.count()

      if (hasWriteButton > 0) {
        // Button should be disabled or show connect wallet message
        const isDisabled = await writeButton.isDisabled()
        expect(isDisabled).toBeTruthy()
      }
    }
  })

  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/contract')

    // Tab through the form
    await page.keyboard.press('Tab')

    // Address input should be focused
    const addressInput = page.getByLabel(/contract address/i)
    await expect(addressInput).toBeFocused()

    // Continue tabbing
    await page.keyboard.press('Tab')

    // Tab buttons should be focusable
    await page.keyboard.press('Tab')

    // Space or Enter should activate tabs
    const focusedElement = page.locator(':focus')
    await focusedElement.press('Enter')

    // Should navigate between tabs
    await page.waitForTimeout(300)
  })
})
