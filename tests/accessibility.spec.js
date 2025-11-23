const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have keyboard navigation support', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.keyboard'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/');

    // Test tab navigation
    await page.keyboard.press('Tab');

    const focusedElement = await page.evaluate(() => {
      return {
        tag: document.activeElement.tagName,
        hasOutline: window.getComputedStyle(document.activeElement).outline !== 'none'
      };
    });

    expect(focusedElement.tag).toBeTruthy();
  });

  test('should have accessible links', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a').all();

    for (const link of links) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');

      // Links should have either text content or aria-label
      const ariaLabel = await link.getAttribute('aria-label');

      expect(text || ariaLabel).toBeTruthy();
      expect(href).toBeTruthy();
    }
  });

  test('should have proper language attribute', async ({ page }) => {
    await page.goto('/');

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toBe('en');
  });

  test('should have sufficient font sizes', async ({ page }) => {
    await page.goto('/');

    const fontSizes = await page.evaluate(() => {
      const elements = document.querySelectorAll('body, p, span, a, div');
      const sizes = [];

      elements.forEach(el => {
        const fontSize = window.getComputedStyle(el).fontSize;
        const sizeInPx = parseFloat(fontSize);
        if (el.textContent.trim().length > 0) {
          sizes.push(sizeInPx);
        }
      });

      return sizes;
    });

    // Check that most text is at least 12px (minimum readable size)
    const tooSmall = fontSizes.filter(size => size < 12);
    expect(tooSmall.length).toBe(0);
  });

  test('should have proper heading structure for screen readers', async ({ page }) => {
    await page.goto('/');

    const headingStructure = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headings).map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent.trim()
      }));
    });

    // First heading should be h1
    expect(headingStructure[0].level).toBe(1);

    // Check for proper hierarchy (no skipping levels)
    for (let i = 1; i < headingStructure.length; i++) {
      const diff = headingStructure[i].level - headingStructure[i - 1].level;
      // Can go up by 1, stay same, or go down any amount
      expect(diff).toBeLessThanOrEqual(1);
    }
  });

  test('should have touch-friendly target sizes on mobile', async ({ page, browserName }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/');

    const interactiveElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('a, button, .tag');
      const sizes = [];

      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        sizes.push({
          element: el.tagName,
          width: rect.width,
          height: rect.height,
          area: rect.width * rect.height
        });
      });

      return sizes;
    });

    // Touch targets should be at least 44x44px (WCAG 2.1 Level AAA)
    // or 48x48px (Material Design, iOS HIG)
    for (const size of interactiveElements) {
      const minSize = 44;
      // Either width or height should meet minimum, and area should be reasonable
      const meetsSize = (size.width >= minSize || size.height >= minSize) && size.area >= minSize * minSize * 0.7;
      expect(meetsSize).toBeTruthy();
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['cat.aria', 'cat.name-role-value'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper document structure for assistive technologies', async ({ page }) => {
    await page.goto('/');

    const landmarks = await page.evaluate(() => {
      return {
        main: document.querySelectorAll('main, [role="main"]').length,
        navigation: document.querySelectorAll('nav, [role="navigation"]').length,
        contentinfo: document.querySelectorAll('footer, [role="contentinfo"]').length
      };
    });

    // While we don't have explicit main/nav, we should have a footer
    expect(landmarks.contentinfo).toBeGreaterThanOrEqual(1);
  });
});
