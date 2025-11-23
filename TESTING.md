# Testing Documentation

This document describes the comprehensive test suite for the Security Operations landing page.

## Overview

The test suite covers:
- ✅ HTML validation
- ♿ Accessibility (WCAG 2.1 AA compliance)
- 🔗 Link validation
- 📱 Responsive design
- 🎨 Visual regression testing

## Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)

## Installation

```bash
npm install
npm run playwright:install
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites

#### HTML Validation
```bash
npm run test:validate
```
Validates HTML5 compliance, proper structure, and semantic correctness.

#### Accessibility Tests
```bash
npm run test:accessibility
```
Tests WCAG 2.1 Level AA compliance using axe-core.

#### Link Validation
```bash
npm run test:links
```
Verifies all links are valid, clickable, and properly secured.

#### Responsive Design Tests
```bash
npm run test:responsive
```
Tests layout and functionality across multiple viewport sizes.

#### Visual Regression Tests
```bash
npm run test:visual
```
Captures and compares screenshots to detect visual changes.

### Interactive Mode

#### Run with UI
```bash
npm run test:ui
```
Opens Playwright's interactive test UI for debugging.

#### Run in Headed Mode
```bash
npm run test:headed
```
Runs tests in a visible browser window.

## Test Structure

```
tests/
├── html-validation.spec.js  # HTML structure and validation
├── accessibility.spec.js    # WCAG compliance and a11y
├── links.spec.js           # Link validation and security
├── responsive.spec.js      # Responsive design testing
└── visual.spec.js          # Visual regression testing
```

## Continuous Integration

Tests run automatically on GitHub Actions for:
- Push to main/master/develop branches
- Pull requests
- Manual workflow dispatch

### CI Jobs

1. **Test**: Runs all functional tests
2. **Accessibility**: Focused accessibility audit
3. **Visual Regression**: Captures and compares visual snapshots

View test results in the Actions tab of your GitHub repository.

## Test Coverage Details

### 1. HTML Validation (`html-validation.spec.js`)

Tests:
- Valid HTML5 doctype
- Required meta tags (charset, viewport)
- Title tag presence and content
- Proper semantic HTML structure
- No duplicate IDs
- Proper heading hierarchy

### 2. Accessibility Tests (`accessibility.spec.js`)

Tests:
- WCAG 2.1 Level AA compliance
- Color contrast ratios
- Keyboard navigation support
- Focus indicators
- Accessible links with descriptive text
- Proper language attributes
- Sufficient font sizes (minimum 12px)
- Proper heading structure for screen readers
- Touch-friendly target sizes (minimum 44x44px)
- Screen reader navigation support
- Document structure for assistive technologies

### 3. Link Validation (`links.spec.js`)

Tests:
- All links have valid href attributes
- Simplex Chat link is correct
- External resources (Google Fonts) are accessible
- External links have proper security attributes
- All links are clickable and not obscured
- Hover states work correctly
- Links have descriptive text
- No broken internal anchors
- Proper link spacing for touch devices

### 4. Responsive Design Tests (`responsive.spec.js`)

Tests across multiple viewports:
- iPhone SE (375x667)
- iPhone XR (414x896)
- iPad (768x1024)
- iPad Landscape (1024x768)
- Desktop (1280x720)
- Desktop Large (1920x1080)

Verifies:
- Proper rendering at all viewport sizes
- Container width constraints
- Font size adjustments on mobile
- Layout changes (flex-direction)
- Padding adjustments
- No horizontal scroll
- Tag wrapping
- Readability at all sizes
- Contact button accessibility
- Section spacing
- Content centering on large screens

### 5. Visual Regression Tests (`visual.spec.js`)

Captures screenshots of:
- Full page on desktop, mobile, and tablet
- Individual sections (header, tags, contact button, footer)
- Hover states
- Info-row layouts
- Page load states

Verifies:
- Consistent colors across the page
- Button colors match design
- Border styles are correct
- Fonts load properly
- Layout maintains on zoom
- Smooth transitions
- No visual glitches during page load

## Interpreting Test Results

### Passing Tests ✅
All checks passed. The site meets quality standards.

### Failing Tests ❌
Review the error output to identify:
- Which test failed
- Expected vs. actual results
- Screenshots (for visual tests)

### Visual Regression Failures 📸
First-time runs will create baseline screenshots. Subsequent runs compare against these baselines. If visual tests fail:

1. Review the diff images in `test-results/`
2. If changes are intentional, update baselines:
   ```bash
   npm run test:visual -- --update-snapshots
   ```

## Debugging Tests

### Debug a Specific Test
```bash
npx playwright test tests/accessibility.spec.js --debug
```

### View Last Test Report
```bash
npx playwright show-report
```

### Generate Trace for Failed Tests
Traces are automatically generated for failed tests. View them:
```bash
npx playwright show-trace test-results/trace.zip
```

## Best Practices

1. **Run tests locally** before pushing code
2. **Update visual baselines** when design changes are intentional
3. **Review accessibility violations** carefully - they affect real users
4. **Check test reports** in CI before merging PRs
5. **Keep dependencies updated** for security and new features

## Troubleshooting

### Tests fail with "Target closed" error
The local web server may not be running. Playwright should start it automatically, but you can start it manually:
```bash
python3 -m http.server 8080
```

### Visual tests always fail
Delete the old baselines and regenerate:
```bash
rm -rf test-results/
npm run test:visual -- --update-snapshots
```

### Accessibility tests fail unexpectedly
Review the specific violations in the test output. axe-core provides detailed information about:
- Which element failed
- Which WCAG criterion was violated
- How to fix it

### CI tests pass but local tests fail
Ensure you're using the same Node.js version as CI (20.x). Check with:
```bash
node --version
```

## Adding New Tests

1. Create a new `.spec.js` file in the `tests/` directory
2. Follow the existing test structure:
   ```javascript
   const { test, expect } = require('@playwright/test');

   test.describe('My Test Suite', () => {
     test('should do something', async ({ page }) => {
       await page.goto('/');
       // Your test code
     });
   });
   ```
3. Add a npm script in `package.json` if needed
4. Update this documentation

## Resources

- [Playwright Documentation](https://playwright.dev)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [HTML Validate](https://html-validate.org)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Playwright and tool documentation
3. Check test output for specific error messages
4. Review CI logs in GitHub Actions
