const { test, expect } = require('@playwright/test');

const viewports = {
  mobile: { width: 375, height: 667, name: 'iPhone SE' },
  mobileLarge: { width: 414, height: 896, name: 'iPhone XR' },
  tablet: { width: 768, height: 1024, name: 'iPad' },
  tabletLandscape: { width: 1024, height: 768, name: 'iPad Landscape' },
  desktop: { width: 1280, height: 720, name: 'Desktop' },
  desktopLarge: { width: 1920, height: 1080, name: 'Desktop Large' },
};

test.describe('Responsive Design Tests', () => {
  for (const [key, viewport] of Object.entries(viewports)) {
    test(`should render correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      // Page should be visible and not broken
      await expect(page.locator('body')).toBeVisible();

      // Main container should be visible
      await expect(page.locator('.container')).toBeVisible();

      // All sections should be visible
      const sections = await page.locator('section').all();
      for (const section of sections) {
        await expect(section).toBeVisible();
      }
    });
  }

  test('should have proper container width on desktop', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');

    const containerWidth = await page.locator('.container').evaluate(el =>
      el.getBoundingClientRect().width
    );

    // Container should be max 640px as per CSS
    expect(containerWidth).toBeLessThanOrEqual(640);
  });

  test('should have proper container width on mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');

    const containerWidth = await page.locator('.container').evaluate(el =>
      el.getBoundingClientRect().width
    );

    // Container should fit within viewport with padding
    expect(containerWidth).toBeLessThanOrEqual(viewports.mobile.width);
  });

  test('should adjust font size on mobile', async ({ page }) => {
    // Test desktop
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    const desktopH1Size = await page.locator('h1').evaluate(el =>
      parseInt(window.getComputedStyle(el).fontSize)
    );

    // Test mobile
    await page.setViewportSize(viewports.mobile);
    await page.reload();
    const mobileH1Size = await page.locator('h1').evaluate(el =>
      parseInt(window.getComputedStyle(el).fontSize)
    );

    // H1 should be smaller on mobile (42px desktop, 32px mobile)
    expect(mobileH1Size).toBeLessThan(desktopH1Size);
    expect(mobileH1Size).toBe(32);
    expect(desktopH1Size).toBe(42);
  });

  test('should change info-row layout on mobile', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');
    const desktopLayout = await page.locator('.info-row').first().evaluate(el =>
      window.getComputedStyle(el).flexDirection
    );

    // Test mobile layout
    await page.setViewportSize(viewports.mobile);
    await page.reload();
    const mobileLayout = await page.locator('.info-row').first().evaluate(el =>
      window.getComputedStyle(el).flexDirection
    );

    // Should be row on desktop, column on mobile
    expect(desktopLayout).toBe('row');
    expect(mobileLayout).toBe('column');
  });

  test('should have proper padding on mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');

    const containerPadding = await page.locator('.container').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        top: parseInt(styles.paddingTop),
        left: parseInt(styles.paddingLeft),
        right: parseInt(styles.paddingRight)
      };
    });

    // Mobile should have 80px top padding and 24px horizontal padding
    expect(containerPadding.top).toBe(80);
    expect(containerPadding.left).toBe(24);
    expect(containerPadding.right).toBe(24);
  });

  test('should have proper padding on desktop', async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await page.goto('/');

    const containerPadding = await page.locator('.container').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        top: parseInt(styles.paddingTop),
        left: parseInt(styles.paddingLeft),
        right: parseInt(styles.paddingRight)
      };
    });

    // Desktop should have 120px top padding and 32px horizontal padding
    expect(containerPadding.top).toBe(120);
    expect(containerPadding.left).toBe(32);
    expect(containerPadding.right).toBe(32);
  });

  test('should have no horizontal scroll on any viewport', async ({ page }) => {
    for (const [key, viewport] of Object.entries(viewports)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('should wrap tags properly on mobile', async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');

    const tagsContainer = await page.locator('.tags').evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        flexWrap: styles.flexWrap
      };
    });

    expect(tagsContainer.display).toBe('flex');
    expect(tagsContainer.flexWrap).toBe('wrap');
  });

  test('should maintain readability at all viewport sizes', async ({ page }) => {
    for (const [key, viewport] of Object.entries(viewports)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      // Check body font size is readable
      const bodyFontSize = await page.locator('body').evaluate(el =>
        parseInt(window.getComputedStyle(el).fontSize)
      );

      expect(bodyFontSize).toBeGreaterThanOrEqual(14);

      // Check line height is comfortable
      const lineHeight = await page.locator('.bio').evaluate(el =>
        parseFloat(window.getComputedStyle(el).lineHeight) / parseFloat(window.getComputedStyle(el).fontSize)
      );

      expect(lineHeight).toBeGreaterThanOrEqual(1.5);
    }
  });

  test('should keep contact button accessible on all viewports', async ({ page }) => {
    for (const [key, viewport] of Object.entries(viewports)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      const contactButton = page.locator('.contact-link');
      await expect(contactButton).toBeVisible();

      const buttonSize = await contactButton.boundingBox();
      expect(buttonSize.width).toBeGreaterThan(0);
      expect(buttonSize.height).toBeGreaterThanOrEqual(40); // Minimum touch target
    }
  });

  test('should maintain proper spacing between sections on all viewports', async ({ page }) => {
    for (const [key, viewport] of Object.entries(viewports)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      const sections = await page.locator('section').all();

      for (const section of sections) {
        const marginBottom = await section.evaluate(el =>
          parseInt(window.getComputedStyle(el).marginBottom)
        );

        // Sections should have reasonable spacing
        expect(marginBottom).toBeGreaterThan(0);
      }
    }
  });

  test('should center content properly on large screens', async ({ page }) => {
    await page.setViewportSize(viewports.desktopLarge);
    await page.goto('/');

    const container = await page.locator('.container').evaluate(el => {
      const rect = el.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const leftMargin = rect.left;
      const rightMargin = viewportWidth - rect.right;

      return {
        leftMargin,
        rightMargin,
        isCentered: Math.abs(leftMargin - rightMargin) < 5 // Allow 5px tolerance
      };
    });

    expect(container.isCentered).toBeTruthy();
  });

  test('should have consistent tag appearance across viewports', async ({ page }) => {
    const tagStyles = {};

    for (const [key, viewport] of Object.entries(viewports)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      tagStyles[key] = await page.locator('.tag').first().evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          fontSize: styles.fontSize,
          padding: styles.padding,
          borderRadius: styles.borderRadius
        };
      });
    }

    // Font size and styling should be consistent
    const firstStyle = tagStyles[Object.keys(tagStyles)[0]];
    for (const [key, style] of Object.entries(tagStyles)) {
      expect(style.fontSize).toBe(firstStyle.fontSize);
      expect(style.borderRadius).toBe(firstStyle.borderRadius);
    }
  });
});
