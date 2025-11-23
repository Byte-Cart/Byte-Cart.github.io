const { test, expect } = require('@playwright/test');

test.describe('HTML Validation', () => {
  test('should have valid HTML5 structure', async ({ page }) => {
    await page.goto('/');

    // Check for proper doctype
    const doctype = await page.evaluate(() => {
      const node = document.doctype;
      return node ? {
        name: node.name,
        publicId: node.publicId,
        systemId: node.systemId
      } : null;
    });

    expect(doctype).not.toBeNull();
    expect(doctype.name).toBe('html');
  });

  test('should have required meta tags', async ({ page }) => {
    await page.goto('/');

    // Check charset
    const charset = await page.locator('meta[charset]').getAttribute('charset');
    expect(charset).toBe('UTF-8');

    // Check viewport
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1.0');
  });

  test('should have valid title tag', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toBe('Security Operations & Infrastructure');
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    await page.goto('/');

    // Check for main structural elements
    const html = await page.locator('html').count();
    const head = await page.locator('head').count();
    const body = await page.locator('body').count();

    expect(html).toBe(1);
    expect(head).toBe(1);
    expect(body).toBe(1);
  });

  test('should have all sections properly structured', async ({ page }) => {
    await page.goto('/');

    // Check main container
    const container = await page.locator('.container').count();
    expect(container).toBe(1);

    // Check for h1
    const h1 = await page.locator('h1').count();
    expect(h1).toBe(1);

    // Check for sections
    const sections = await page.locator('section').count();
    expect(sections).toBeGreaterThan(0);

    // Check footer
    const footer = await page.locator('footer').count();
    expect(footer).toBe(1);
  });

  test('should have no duplicate IDs', async ({ page }) => {
    await page.goto('/');

    const ids = await page.evaluate(() => {
      const elements = document.querySelectorAll('[id]');
      const idList = Array.from(elements).map(el => el.id);
      const uniqueIds = new Set(idList);
      return {
        total: idList.length,
        unique: uniqueIds.size,
        ids: idList
      };
    });

    expect(ids.total).toBe(ids.unique);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const headings = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1');
      const h2s = document.querySelectorAll('h2');
      return {
        h1Count: h1s.length,
        h2Count: h2s.length
      };
    });

    // Should have exactly one h1
    expect(headings.h1Count).toBe(1);
    // Should have h2s for sections
    expect(headings.h2Count).toBeGreaterThan(0);
  });
});
