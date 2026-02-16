# Tulsa vs Series — Production Playbook

How we go from idea to published LinkedIn post. Each episode compares Tulsa to another city or concept, with original data visualization. No two episodes should look or feel the same.

---

## Phase 1: Ideation (Monday)

**Goal:** Pick this week's episode based on what's trending.

1. **Scan for topical hooks** — news, trending LinkedIn posts, tech layoffs, housing market shifts, remote work debates, anything Tulsa-adjacent
2. **Match to a "Tulsa vs ___" angle** — the comparison should feel timely, not random
3. **Draft a one-liner pitch** — if you can't hook someone in one sentence, pick a different topic
4. **Corey approves or redirects** via iMessage

**Pitch format:**
```
TULSA VS [CITY/CONCEPT]: [ONE-LINE HOOK]
Data angle: [what we're comparing]
Why now: [what makes this timely]
```

**Past episode for reference:**
- Tulsa vs Austin: "Is Austin still worth it for tech workers?" — salary purchasing power, housing, growth. Timely because of ongoing Austin cost-of-living discourse.

### Variety Rules
- **Rotate comparison types:** city vs city, Tulsa vs national avg, Tulsa vs concept (remote work, AI hubs, etc.)
- **Rotate chart types:** Don't repeat the same viz style back-to-back. Options: bar charts, maps, scatter plots, slope charts, small multiples, treemaps, Sankey diagrams, bump charts, timeline, gauge/meter
- **Rotate data domains:** salary, housing, education, commute, healthcare, entertainment, startup funding, job growth, crime, weather, food cost
- **Keep the scorecard as the signature closer** but vary how it looks

---

## Phase 2: Research (Monday–Tuesday)

**Goal:** Gather verified, sourceable data. Every number needs a clickable link.

1. **Identify 3-5 data dimensions** for the comparison (e.g., salary, housing, job growth, quality of life)
2. **Find primary sources** — BLS, Census, BestPlaces, Zillow, Redfin, BEA, FRED, local chamber data
3. **Cross-reference** — never use a single source for a key claim
4. **Document everything** in `research/tulsa-vs/[episode]/notes.md`
5. **Build `data.json`** with source attribution per data point:

```json
{
  "sources": [
    { "name": "Bureau of Labor Statistics", "url": "https://...", "accessed": "2026-02-XX" }
  ],
  "salary": {
    "tulsa": 94682,
    "source": "BLS OEWS 2024"
  }
}
```

### Source Quality Tiers
- **Tier 1 (required for key claims):** BLS, Census Bureau, BEA, FRED, SEC filings
- **Tier 2 (supporting):** BestPlaces, Zillow, Redfin, Glassdoor, LinkedIn Economic Graph
- **Tier 3 (color/context only):** News articles, blog posts, Reddit threads

---

## Phase 3: Story Structure (Tuesday–Wednesday)

**Goal:** Outline the scroll narrative before touching code.

Every episode follows this arc but the content varies:

1. **Hero** — title, byline ("By Corey Thompson of Tulsa Software"), date
2. **Setup** (1-2 steps) — establish the comparison, show the obvious numbers
3. **Twist** (1-2 steps) — reveal what the surface numbers hide (e.g., cost-of-living adjustment flips the salary story)
4. **Depth** (1-2 steps) — a second data dimension that reinforces the twist
5. **Scorecard** — the signature closer, tallying winners across categories
6. **Sources** — every data point linked

**Write the step text FIRST as plain copy.** If the narrative doesn't work as text, no amount of D3 will save it.

### Outline template:
```
EPISODE: Tulsa vs [X]
HOOK: [one sentence]
STEP 1: [what we show, what we say]
STEP 2: ...
CHART TYPES: [what viz style per section]
TWIST: [where the story turns]
SCORECARD: [categories, who wins each]
```

---

## Phase 4: Build (Wednesday–Thursday)

**Goal:** Code the visualization. Use the `tulsa-software-viz` repo.

### File structure per episode:
```
src/stories/tulsa-vs/[city]/
  ├── index.html      # Scroll structure + steps
  ├── style.css       # Episode-specific styles
  ├── script.js       # D3 charts + Scrollama
  └── data.json       # All data with sources
```

### Technical patterns (lessons learned):
- **Animations must be interrupt-safe:** Set final state FIRST, then animate from zero. Use the `animateBar()` helper pattern. Never rely on transitions completing.
- **Pre-render first step** of each chart section on page load
- **Mobile-first:** Sticky chart at 35-40vh, steps with 50vh+ margins, full opacity text
- **No `scroll-behavior: smooth`** — breaks iOS
- **SVG viewBox scaling** compresses distances on mobile — test overlap with SVG coordinates, not rendered pixels
- **Clean up annotations** when switching steps (`.remove()` old ones before adding new)

### D3 chart library to draw from:
- Horizontal bar charts (salary comparisons) ✅ used in ep01
- Vertical bar charts (housing, growth) ✅ used in ep01
- Scorecard table (punchline) ✅ used in ep01
- Slope charts (before/after adjustments) — NOT YET USED
- Small multiples — NOT YET USED
- Map/choropleth — NOT YET USED
- Scatter plot — NOT YET USED
- Sankey/flow diagram — NOT YET USED
- Bump chart (rankings over time) — NOT YET USED

---

## Phase 5: Test (Thursday)

**Goal:** Playwright tests must pass before PR.

```bash
npm run build
npm test
```

### Required tests per episode:
1. Hero loads with title
2. All steps exist and have content
3. Chart containers exist for each section
4. Sources section has links
5. Scrolling activates steps and renders SVGs
6. Scrolling through all data steps renders all elements
7. Scroll-back re-renders previous state
8. Mobile: scorecard/table text doesn't overlap
9. Mobile: active step text visible alongside chart
10. Full scroll-through with no JS errors

---

## Phase 6: Review & Deploy (Thursday–Friday)

1. **Create PR** → Netlify auto-builds deploy preview
2. **Corey reviews on phone** — mobile experience is the priority
3. **Fix feedback** → push to same branch
4. **Add card to site index** (`index.html`) — see format below
5. **Merge** → auto-deploys to `tulsasoftwareviz.netlify.app`
6. **Add card to developer portfolio** (DataProjects.razor + thumbnail SVG)

### Index Card Format

Add a card to `index.html` for each new article:

```html
<a href="/src/stories/head-to-head/tulsa-vs-[topic]/">
  <span style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:#c23616;font-weight:600;">Tulsa Versus</span>
  <h2 style="font-size:1.4rem;margin:0.3rem 0;">[Title]</h2>
  <p style="color:#666;font-size:0.95rem;">[One-line description]</p>
  <span style="font-size:0.75rem;color:#999;">[Month Year] · [X] min read</span>
</a>
```

**Rules:**
- Series label is always "Tulsa Versus" (no episode numbers)
- Newest articles go at the top
- Keep descriptions under 150 characters

---

## Phase 7: LinkedIn Post (Friday)

1. **Write post copy** — hook + 3-4 key insights + CTA to the viz
2. **Screenshot the scorecard** as the post image (visual hook)
3. **Link to the live viz** for people who want to explore
4. **Tag relevant:** #TulsaTech #DataVisualization #[TopicTag]
5. **Post timing:** Tuesday or Wednesday 8-10 AM CST (peak LinkedIn engagement)

*Note: LinkedIn API integration is a future TODO. For now, Corey posts manually.*

---

## Episode Ideas Backlog

Track in Todoist project "Tulsa vs Series" (id: 2366673921).

### Rotating themes to keep it fresh:
- **City matchups:** Austin ✅, Silicon Valley, Denver, Nashville, Dallas, Phoenix, Boise, Raleigh
- **Concept matchups:** Remote Work, AI Hub Cities, Startup Ecosystems, College Towns
- **Timely hooks:** "Tulsa vs [wherever just had layoffs]", "Tulsa vs [city in the news]"
- **Data-first:** "Tulsa vs Everyone: The Commute Edition", "Tulsa vs the Coasts: Where $100K Goes Furthest"

### Never repeat:
- Same chart style two weeks in a row
- Same data dimensions (if last week was salary/housing, this week try education/healthcare/startups)
- Same city within a quarter (unless major news warrants it)

---

## Weekly Schedule

| Time | Task |
|------|------|
| **Mon 8 AM** | Cron pitches episode idea to Corey via iMessage |
| **Mon morning** | Corey approves or redirects |
| **Mon (after approval)** | Research, story outline, build, test — all in one push |
| **Mon evening** | PR with Netlify preview → Corey reviews on phone |
| **Mon night** | Fix any feedback |
| **Tue 8-10 AM** | Post to LinkedIn |

The entire pipeline from pitch to post happens in ~24 hours. Tenlee handles research, build, and testing autonomously after Corey approves the pitch. Corey's only touchpoints are: approve the pitch, review the preview, post to LinkedIn.

---

*This playbook is a living doc. Update it as we learn what works.*
