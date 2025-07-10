import { test, expect } from '@playwright/test'

test.describe('Overcooked Multiplayer Game', () => {
  test('should load the game and display canvas', async ({ page }) => {
    await page.goto('/')
    
    // Wait for the game canvas to load
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // Check canvas dimensions
    await expect(canvas).toHaveAttribute('width', '800')
    await expect(canvas).toHaveAttribute('height', '600')
    
    // Take screenshot of initial game state
    await page.screenshot({ 
      path: 'screenshots/game-initial-load.png',
      fullPage: true 
    })
  })

  test('should display game UI elements', async ({ page }) => {
    await page.goto('/')
    
    // Wait for the canvas to be visible
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // Wait a moment for the game to initialize
    await page.waitForTimeout(1000)
    
    // Take screenshot showing UI elements
    await page.screenshot({ 
      path: 'screenshots/game-ui-elements.png',
      fullPage: true 
    })
  })

  test('should handle player movement', async ({ page }) => {
    await page.goto('/')
    
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // Focus on the canvas to enable keyboard input
    await canvas.click()
    
    // Wait for game initialization
    await page.waitForTimeout(1000)
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'screenshots/player-initial-position.png',
      fullPage: true 
    })
    
    // Simulate player movement
    await page.keyboard.press('KeyW') // Move up
    await page.waitForTimeout(500)
    await page.keyboard.press('KeyD') // Move right
    await page.waitForTimeout(500)
    
    // Take screenshot after movement
    await page.screenshot({ 
      path: 'screenshots/player-after-movement.png',
      fullPage: true 
    })
  })

  test('should handle ingredient interactions', async ({ page }) => {
    await page.goto('/')
    
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    await canvas.click()
    
    // Wait for game initialization
    await page.waitForTimeout(2000)
    
    // Move player to ingredient box (green box at 50, 200)
    await page.keyboard.press('KeyA') // Move left
    await page.waitForTimeout(300)
    await page.keyboard.press('KeyS') // Move down
    await page.waitForTimeout(300)
    
    // Interact to pick up ingredient
    await page.keyboard.press('Space')
    await page.waitForTimeout(500)
    
    // Take screenshot showing picked up ingredient
    await page.screenshot({ 
      path: 'screenshots/ingredient-pickup.png',
      fullPage: true 
    })
    
    // Move to prep counter
    await page.keyboard.press('KeyD') // Move right
    await page.waitForTimeout(300)
    await page.keyboard.press('KeyW') // Move up
    await page.waitForTimeout(300)
    
    // Chop ingredient
    await page.keyboard.press('Space')
    await page.waitForTimeout(500)
    
    // Take screenshot showing chopped ingredient
    await page.screenshot({ 
      path: 'screenshots/ingredient-chopped.png',
      fullPage: true 
    })
  })

  test('should display orders and scoring', async ({ page }) => {
    await page.goto('/')
    
    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    
    // Wait for first order to appear (5 seconds)
    await page.waitForTimeout(6000)
    
    // Take screenshot showing orders
    await page.screenshot({ 
      path: 'screenshots/orders-display.png',
      fullPage: true 
    })
  })

  test('should handle multiplayer connections', async ({ browser }) => {
    // Create two browser contexts for multiplayer testing
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()
    
    // Load game in both browsers
    await page1.goto('/')
    await page2.goto('/')
    
    // Wait for both games to load
    await expect(page1.locator('canvas')).toBeVisible()
    await expect(page2.locator('canvas')).toBeVisible()
    
    await page1.waitForTimeout(2000)
    await page2.waitForTimeout(2000)
    
    // Take screenshots of both player views
    await page1.screenshot({ 
      path: 'screenshots/multiplayer-player1.png',
      fullPage: true 
    })
    
    await page2.screenshot({ 
      path: 'screenshots/multiplayer-player2.png',
      fullPage: true 
    })
    
    // Test movement synchronization
    await page1.locator('canvas').click()
    await page1.keyboard.press('KeyW')
    await page1.waitForTimeout(500)
    
    await page2.screenshot({ 
      path: 'screenshots/multiplayer-player1-moved.png',
      fullPage: true 
    })
    
    await context1.close()
    await context2.close()
  })
})