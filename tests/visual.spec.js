const { test, expect } = require('@playwright/test');

test.describe('Visual Regression Tests', () => {
  test('should match desktop homepage snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match mobile homepage snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match tablet homepage snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match header section snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const header = page.locator('h1').first();
    await expect(header).toHaveScreenshot('header-section.png');
  });

  test('should match tags section snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tagsSection = page.locator('.tags');
    await expect(tagsSection).toHaveScreenshot('tags-section.png');
  });

  test('should match contact button snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const contactButton = page.locator('.contact-link');
    await expect(contactButton).toHaveScreenshot('contact-button.png');
  });

  test('should match contact button hover state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const contactButton = page.locator('.contact-link');
    await contactButton.hover();
    await page.waitForTimeout(300); // Wait for transition

    await expect(contactButton).toHaveScreenshot('contact-button-hover.png');
  });

  test('should match tag hover state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tag = page.locator('.tag').first();
    await tag.hover();
    await page.waitForTimeout(300); // Wait for transition

    await expect(tag).toHaveScreenshot('tag-hover.png');
  });

  test('should match info-row section snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const infoRows = page.locator('.info-row').first();
    await expect(infoRows).toHaveScreenshot('info-row.png');
  });

  test('should match footer snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer');
    await expect(footer).toHaveScreenshot('footer.png');
  });

  test('should have consistent colors across page', async ({ page }) => {
    await page.goto('/');

    const colors = await page.evaluate(() => {
      const body = document.body;
      const h1 = document.querySelector('h1');
      const subtitle = document.querySelector('.subtitle');
      const bio = document.querySelector('.bio');

      return {
        bodyBg: window.getComputedStyle(body).backgroundColor,
        bodyColor: window.getComputedStyle(body).color,
        h1Color: window.getComputedStyle(h1).color,
        subtitleColor: window.getComputedStyle(subtitle).color,
        bioColor: window.getComputedStyle(bio).color,
      };
    });

    // Verify expected colors
    expect(colors.bodyBg).toBe('rgb(10, 10, 10)'); // #0a0a0a
    expect(colors.bodyColor).toBe('rgb(216, 216, 216)'); // #d8d8d8
    expect(colors.h1Color).toBe('rgb(255, 255, 255)'); // #ffffff
    expect(colors.subtitleColor).toBe('rgb(136, 136, 136)'); // #888
    expect(colors.bioColor).toBe('rgb(192, 192, 192)'); // #c0c0c0
  });

  test('should have consistent button colors', async ({ page }) => {
    await page.goto('/');

    const buttonColors = await page.locator('.contact-link').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.backgroundColor,
        color: styles.color,
      };
    });

    expect(buttonColors.background).toBe('rgb(13, 157, 204)'); // #0d9dcc
    expect(buttonColors.color).toBe('rgb(10, 10, 10)'); // #0a0a0a
  });

  test('should have proper border styles', async ({ page }) => {
    await page.goto('/');

    const borders = await page.evaluate(() => {
      const tag = document.querySelector('.tag');
      const infoRow = document.querySelector('.info-row');
      const footer = document.querySelector('footer');

      return {
        tagBorder: window.getComputedStyle(tag).borderColor,
        infoRowBorder: window.getComputedStyle(infoRow).borderBottomColor,
        footerBorder: window.getComputedStyle(footer).borderTopColor,
      };
    });

    expect(borders.tagBorder).toBe('rgb(34, 34, 34)'); // #222
    expect(borders.infoRowBorder).toBe('rgb(26, 26, 26)'); // #1a1a1a
    expect(borders.footerBorder).toBe('rgb(26, 26, 26)'); // #1a1a1a
  });

  test('should load fonts correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const fontFamily = await page.locator('body').evaluate(el =>
      window.getComputedStyle(el).fontFamily
    );

    // Should include Inter font
    expect(fontFamily).toContain('Inter');
  });

  test('should maintain layout on zoom', async ({ page }) => {
    await page.goto('/');

    // Test at different zoom levels
    const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5];

    for (const zoom of zoomLevels) {
      await page.evaluate((z) => {
        document.body.style.zoom = z;
      }, zoom);

      // Check that main elements are still visible
      await expect(page.locator('.container')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.contact-link')).toBeVisible();

      // No horizontal scroll at any zoom level
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('should have smooth transitions', async ({ page }) => {
    await page.goto('/');

    // Check tag transition
    const tagTransition = await page.locator('.tag').first().evaluate(el =>
      window.getComputedStyle(el).transition
    );
    expect(tagTransition).toContain('all');
    expect(tagTransition).toContain('0.2s');

    // Check button transition
    const buttonTransition = await page.locator('.contact-link').evaluate(el =>
      window.getComputedStyle(el).transition
    );
    expect(buttonTransition).toContain('background');
    expect(buttonTransition).toContain('0.2s');
  });

  test('should match mobile info-row layout snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const infoRow = page.locator('.info-row').first();
    await expect(infoRow).toHaveScreenshot('info-row-mobile.png');
  });

  test('should have no visual glitches during page load', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Take screenshot immediately after DOM load
    await expect(page).toHaveScreenshot('page-load-initial.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Wait for everything to settle
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Take screenshot after load
    await expect(page).toHaveScreenshot('page-load-complete.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
