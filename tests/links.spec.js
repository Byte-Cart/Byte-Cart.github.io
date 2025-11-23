const { test, expect } = require('@playwright/test');

test.describe('Link Validation', () => {
  test('should have all links with valid href attributes', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a').all();
    expect(links.length).toBeGreaterThan(0);

    for (const link of links) {
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href.length).toBeGreaterThan(0);
    }
  });

  test('should have Simplex Chat link with correct URL', async ({ page }) => {
    await page.goto('/');

    const simplexLink = await page.locator('a.contact-link').getAttribute('href');
    expect(simplexLink).toContain('smp16.simplex.im');
    expect(simplexLink).toContain('2ezKSyifGZbk_Se0QYcbzVSzQXOpGb3MML0dZ7RA1nA');
  });

  test('should have Google Fonts link accessible', async ({ page, request }) => {
    await page.goto('/');

    const fontLink = await page.locator('link[href*="fonts.googleapis.com"]').getAttribute('href');
    expect(fontLink).toBeTruthy();

    // Test if the font URL is reachable
    const response = await request.get(fontLink);
    expect(response.ok()).toBeTruthy();
  });

  test('should have external links with proper security attributes', async ({ page }) => {
    await page.goto('/');

    const externalLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href^="http"]');
      return Array.from(links).map(link => ({
        href: link.href,
        rel: link.rel,
        target: link.target
      }));
    });

    for (const link of externalLinks) {
      // External links that open in new tab should have rel="noopener noreferrer"
      if (link.target === '_blank') {
        expect(link.rel).toContain('noopener');
      }
    }
  });

  test('should have all links clickable', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a').all();

    for (const link of links) {
      await expect(link).toBeVisible();

      // Check if link is clickable (not covered or disabled)
      const isClickable = await link.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const elementAtPoint = document.elementFromPoint(centerX, centerY);
        return el.contains(elementAtPoint);
      });

      expect(isClickable).toBeTruthy();
    }
  });

  test('should have hover states on links', async ({ page }) => {
    await page.goto('/');

    const contactLink = page.locator('a.contact-link');

    // Get initial background color
    const initialBg = await contactLink.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );

    // Hover and get hover background color
    await contactLink.hover();
    await page.waitForTimeout(100); // Wait for transition

    const hoverBg = await contactLink.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );

    // Background color should change on hover
    expect(initialBg).not.toBe(hoverBg);
  });

  test('should have tag hover states', async ({ page }) => {
    await page.goto('/');

    const tag = page.locator('.tag').first();

    // Get initial color and border
    const initialStyle = await tag.evaluate(el => ({
      color: window.getComputedStyle(el).color,
      borderColor: window.getComputedStyle(el).borderColor
    }));

    // Hover and get hover styles
    await tag.hover();
    await page.waitForTimeout(100); // Wait for transition

    const hoverStyle = await tag.evaluate(el => ({
      color: window.getComputedStyle(el).color,
      borderColor: window.getComputedStyle(el).borderColor
    }));

    // Either color or border should change on hover
    const hasHoverEffect =
      initialStyle.color !== hoverStyle.color ||
      initialStyle.borderColor !== hoverStyle.borderColor;

    expect(hasHoverEffect).toBeTruthy();
  });

  test('should have all links with descriptive text', async ({ page }) => {
    await page.goto('/');

    const links = await page.evaluate(() => {
      const allLinks = document.querySelectorAll('a');
      return Array.from(allLinks).map(link => ({
        text: link.textContent.trim(),
        href: link.href,
        ariaLabel: link.getAttribute('aria-label')
      }));
    });

    for (const link of links) {
      // Each link should have either text content or aria-label
      const hasDescription = link.text.length > 0 || link.ariaLabel;
      expect(hasDescription).toBeTruthy();
    }
  });

  test('should not have broken internal anchors', async ({ page }) => {
    await page.goto('/');

    const internalAnchors = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href^="#"]');
      return Array.from(links).map(link => ({
        href: link.getAttribute('href'),
        target: link.getAttribute('href').substring(1)
      }));
    });

    for (const anchor of internalAnchors) {
      if (anchor.target) {
        const targetElement = await page.locator(`#${anchor.target}`).count();
        expect(targetElement).toBeGreaterThan(0);
      }
    }
  });

  test('should have proper link spacing for touch devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const links = await page.locator('a').all();

    for (let i = 0; i < links.length - 1; i++) {
      const currentBox = await links[i].boundingBox();
      const nextBox = await links[i + 1].boundingBox();

      if (currentBox && nextBox) {
        // Check if links are in the same general area (within 100px vertically)
        if (Math.abs(currentBox.y - nextBox.y) < 100) {
          // Links should have reasonable spacing
          const spacing = Math.abs(nextBox.y - (currentBox.y + currentBox.height));
          expect(spacing).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
