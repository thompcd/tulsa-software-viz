# Contributing — Tulsa Software Viz

## Build Pipeline

Every visualization PR must pass before merge:

```bash
npm run build        # Vite build succeeds
npm test             # Playwright tests pass (desktop + mobile)
```

## Testing Requirements

### Every new story MUST have:
1. **Desktop Chrome tests** — layout, chart rendering, scroll animations
2. **iPhone 14 (webkit) tests** — mobile layout, no text overlap, step visibility
3. **Scroll-back test** — scrolling up re-renders previous chart state correctly
4. **Full scroll-through smoke test** — no JS errors during complete traversal
5. **Source links test** — all data points have source attribution

### Writing Tests
- File: `tests/<story-name>.spec.js`
- Use `scrollIntoViewIfNeeded()` + `waitForTimeout(1500-2000)` for scroll triggers
- Scrollama doesn't reliably fire in headless webkit — use `test.skip()` for tests that depend on it
- Check bounding boxes for text overlap, not just CSS
- Always test scroll-back behavior (users scroll up and down)

### Known Limitations
- Playwright webkit doesn't reliably trigger IntersectionObserver with programmatic scrolling
- Use longer `waitForTimeout` values for mobile webkit (1.5-2x desktop)
- SVG viewBox scaling compresses pixel distances on mobile — account for this in overlap tests

## Mobile-First Design Rules

1. **Step spacing**: min `margin-bottom: 60vh` on mobile so each step triggers its chart
2. **Sticky chart**: `position: sticky; top: 48px` below header, max `35-40vh` height
3. **No tables on mobile**: Use stacked card layouts instead of column tables
4. **Text sizes**: Minimum 10px for labels, 11px for values in SVG
5. **Scorecard/tables**: Separate metric name from values vertically (24px+ gap in SVG coords)
6. **Last section**: Add a spacer div before footer to ensure last scrollama triggers

## Data Journalism Standards

- **Every number must have a source** — no assumptions
- **Sources section** at bottom of every story with clickable links
- **Methodology note** explaining any calculations or adjustments
- **data.json** includes source attribution per data point
