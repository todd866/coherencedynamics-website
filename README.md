# Coherence Dynamics Website

Website for the coherence dynamics research program, featuring papers, simulations, and interactive content.

**Live site:** [coherencedynamics.com](https://coherencedynamics.com)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Homepage
│   ├── papers/            # Papers listing and detail pages
│   │   ├── page.tsx       # /papers - papers index
│   │   └── [slug]/page.tsx # /papers/[slug] - individual paper
│   ├── simulations/       # Interactive simulations
│   ├── scenarios/         # What-if scenarios
│   ├── fiction/           # Creative writing
│   └── about/             # About page
├── components/            # Reusable React components
│   ├── Markdown.tsx       # Markdown renderer with LaTeX
│   ├── PaperNavigation.tsx # Prev/next navigation with keyboard shortcuts
│   └── ...
├── data/
│   └── papers.ts          # Paper metadata and content
└── lib/                   # Utility functions

public/
└── images/
    └── papers/            # Paper figures (PNG, 150 DPI)
```

## Development

```bash
npm install
npm run dev    # http://localhost:3000
```

## Adding a New Paper

1. **Add metadata** to `src/data/papers.ts`:

```typescript
{
  slug: 'paper-slug',           // URL-friendly identifier
  title: 'Full Paper Title',
  journal: 'Journal Name',
  year: 2025,
  status: 'published' | 'submitted' | 'in_prep',
  doi: '10.xxx/xxx',            // optional
  ssrn: 'https://...',          // optional preprint link
  github: 'user/repo',          // optional code repo
  image: 'paper-slug.png',      // figure in /public/images/papers/
  description: `**BLUF summary** — expanded explanation...`,
  whyItMatters: 'Optional section...',
  keyFindings: ['Finding 1', 'Finding 2'],
  workflow: 'AI workflow disclosure...',
}
```

2. **Generate figure** for `public/images/papers/{slug}.png`:
   - Resolution: 150 DPI
   - Aspect ratio: ~16:9 or 3:1 for multi-panel figures
   - White background
   - No text overlapping data points
   - Use matplotlib with `bbox_inches='tight', facecolor='white'`

3. Papers are automatically listed on `/papers` and get their own page at `/papers/{slug}`

## Paper Figure Guidelines

Figures should:
- Have clear panel labels (A, B, C...)
- Use colorblind-friendly palettes when possible
- Place annotations outside data regions
- Include axis labels with units
- Render mathematical notation cleanly

Example generation script pattern:
```python
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
# ... create panels ...
plt.tight_layout()
plt.savefig('public/images/papers/paper-slug.png',
            dpi=150, bbox_inches='tight', facecolor='white')
```

## Features

- **Paper navigation:** Arrow key navigation between papers (←/→)
- **Markdown support:** Full markdown with LaTeX math via `$...$` and `$$...$$`
- **Status badges:** Published (green), Under Review (yellow), In Preparation (gray)
- **External links:** DOI, SSRN preprints, GitHub repos, PDFs

## Deployment

Deployed automatically to Vercel on push to `main`.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Markdown:** react-markdown with remark-math, rehype-katex
- **Hosting:** Vercel

## Interactive Simulations

Simulations live in `src/app/simulations/[slug]/page.tsx`. Each simulation is a companion to a research paper.

### Maxwell's Ledger (`/simulations/maxwells-ledger`)

**Companion paper:** Timing Inaccessibility and the Projection Bound

Two-part simulation exploring how systems detect sub-threshold signals:

#### Part 1: The Hearing Test (Stochastic Resonance)

Demonstrates the trade-off between detection sensitivity and timing precision using an audiometry metaphor.

**Key concepts:**
- **Stochastic resonance:** Adding noise can help detect weak signals that would otherwise be sub-threshold
- **Neural gain compensation:** Damaged ears (fewer hair cells) compensate by boosting internal gain
- **Timing uncertainty:** More gain = better detection but fuzzier timing record
- **Tinnitus as cost:** Boosting gain too much means hearing the noise itself

**Technical implementation:**
- Web Audio API for real audiometry tones (500-6000 Hz OSHA standard frequencies)
- Tinnitus audio: bandpass-filtered white noise at 4kHz, auto-scales with gain level
- Canvas animation: spectrum display with "fat threshold" visualization
- Falling blob animation: detections condense at frequency column and fall to conveyor belt
- Color coding: hue represents frequency (low=red, high=violet)
- Timing error display: ±ms uncertainty shown on each detection

**User interactions (Direct Canvas UI - no external buttons):**
- **Left edge drag**: Neural Gain slider (5-100%) - vertical drag controls internal amplification
- **Right edge drag**: Tone Volume slider (10-100 dB) - vertical drag controls signal amplitude
- **Click frequency bars**: Select and play audiometry tones (500-6000 Hz)
- **Click conveyor belt**: Clear detection history

**Visual feedback:**
- Gain slider changes color (green → orange → yellow) as gain increases
- "TINNITUS" warning appears at high gain levels
- Detection threshold line gets fatter/fuzzier with more noise
- Timing error (±ms) displayed on each detection blob

**Key insight:** Boost gain to detect quieter sounds, but the timing errors grow. The patient heard *something* but can't tell you exactly *when*.

#### Part 2: The Two Demons (Implemented)

Demonstrates bit erasure vs sub-Landauer operation through two simulated Maxwell's Demons:

**Classical Demon:**
- Sorts fast/slow molecules by measuring and recording their velocities
- Records 1 bit per molecule interaction
- Must pay Landauer erasure cost: kT ln 2 per bit
- Has precise timing - knows exactly when molecules cross

**Sub-Landauer Demon:**
- Uses stochastic resonance for detection (no bit recording)
- Zero erasure cost - no information to erase
- Chaotic sorting - can't coordinate, can't build pressure
- Lost timing information is the information it can't use

**The punchline:** Both demons work, but neither is free. The classical demon pays in energy. The sub-Landauer demon pays in timing information - it can sort molecules but can't synchronize with anything else to do useful work.

### Adding a New Simulation

1. Create `src/app/simulations/[slug]/page.tsx`
2. Add entry to `simulations` array in `src/app/simulations/page.tsx`:

```typescript
{
  slug: 'simulation-slug',
  title: 'Simulation Title',
  description: 'What the simulation demonstrates...',
  paper: 'Companion Paper Title',
  paperSlug: 'paper-slug',
  status: 'playable' | 'beta' | 'in_development' | 'coming_soon',
}
```

3. Implement the simulation component with:
   - Canvas for visualization (use `useRef` + animation loop)
   - Web Audio API for sound (if applicable)
   - State for user-controllable parameters
   - Clear explanation panel describing what to do
   - Key insight summary at bottom

### 4D Tesseract Shadow (`/simulations/dimensional-collapse`)

**Companion paper:** High-Dimensional Coherence

Demonstrates dimensional collapse using a true 4-dimensional hypercube projected to 2D.

**Key concepts:**
- **4D geometry:** A tesseract has 16 vertices (all ±1 combinations in 4 dimensions) and 32 edges
- **Dimensional collapse:** The 3D "shadow" you see is a projection of a 4D structure—information is lost
- **Rotation through 4D:** XW, YW, ZW planes are rotation planes that include the 4th dimension
- **Apparent complexity:** The tesseract is perfectly regular in 4D; apparent deformation is the projection

**Technical implementation:**
- Component: `src/components/ObserverDemo.tsx`
- Stereographic projection: 4D → 3D → 2D
- Canvas-based animation with requestAnimationFrame
- Direct drag interaction on tesseract rotates through 4D planes
- Slider controls for continuous rotation speeds

**User interactions:**
- **Drag on tesseract:** Rotate through XW (horizontal drag) and YW (vertical drag) planes
- **Slider controls:** Set continuous rotation speeds for XW, YW, ZW planes
- **fullPage prop:** Component accepts `fullPage={true}` for larger rendering on dedicated pages

**Key insight:** The 3D shape isn't "morphing"—the 4D tesseract is perfectly rigid. What you see as deformation is your measurement apparatus (the projection) collapsing 4D structure into 3D.

### Bits vs Dynamics (`/simulations/bits-vs-dynamics`)

**Companion paper:** Dimensional Landauer Bound

Compares two fundamental system types: bits (billiard balls) vs dynamics (Lorenz attractor).

**Key concepts:**
- **Energy per bit:** Digital computers pay kT ln 2 per bit, per clock cycle (Landauer's bound)
- **Energy per dimension:** Biological systems pay per dimension, deferred until commitment
- **Coherence vs addressability:** You can't have independent bits AND coupled dynamics

**Technical implementation:**
- Component: `src/components/InteractiveHero.tsx`
- Split-panel canvas: billiards on left, Lorenz attractor on right
- Physics simulation for elastic collisions with friction
- Lorenz attractor integration with RK4

**User interactions:**
- **Left panel (Bits):** Click to spawn balls, drag spacetime warp slider to bend table
- **Right panel (Dynamics):** Click and hold to create measurement constraint

**Key insight:** The billiard balls run out of energy; the attractor never does. Same fundamental physics, different organization.

## Interactive Homepage Components

The homepage (`/`) features two interactive visualizations embedded directly:

### InteractiveHero (Bits vs Dynamics)
- Location: Top of homepage, right column
- Same component as `/simulations/bits-vs-dynamics`
- Responsive sizing with `maxWidth` and `aspectRatio`

### ObserverDemo (4D Tesseract)
- Location: "Why Coherence Dynamics" section
- Same component as `/simulations/dimensional-collapse`
- Demonstrates dimensional collapse inline with the explanation text

Both components are reused on their dedicated simulation pages with `fullPage={true}` for larger displays
