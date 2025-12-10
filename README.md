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

## Interactive Homepage Hero (Planned)

The static "Bits vs Dynamics" hero image will become an interactive canvas demonstrating the key conceptual difference.

### Design Concept

**Left Panel: BITS (isolated, incoherent)**
- Scattered colored points floating in 3-space
- Points move randomly (Brownian motion) but have NO long-range interactions
- **Hover over any bit**: Shows tooltip with its coordinates `(x, y, z)` - the bit has a precise location
- **Click**: Creates a new bit at click position with random color
- Points can overlap/collide without affecting each other - they're independent

**Right Panel: DYNAMICS (coupled, coherent)**
- Lorenz attractor or similar chaotic trajectory
- Continuous flow that forms coherent structure
- **Hover anywhere**: The flow wobbles/perturbs but maintains structure - perturbation propagates through entire system
- **Click**: Creates a "measurement point" - a fixed coordinate marker
- **Click and hold**: Creates a "constant measurement" - the attractor deforms and REFORMS AROUND the measurement point, demonstrating how measurement constrains/projects the dynamics
- Visible "wavy interactions" - lines connecting nearby trajectory points showing long-range coupling

### Key Interactions to Implement

1. **Bit coordinate display**: When hovering over a bit on the left, show `(1.23, -0.45, 0.87)` style coordinates
2. **Dynamics wobble**: When hovering over the right panel, add perturbation to Lorenz equations that decays over time
3. **Click-to-measure**: Click on dynamics creates a fixed point; the attractor continues but is visually attracted/repelled by the measurement
4. **Hold-to-constrain**: Holding mouse down on dynamics shows the system reforming around the constraint point - demonstrates projection/dimensional collapse
5. **No bit interactions**: Bits on left should explicitly NOT interact - they can pass through each other

### Implementation Notes

- Component: `src/components/InteractiveHero.tsx`
- Replace static Image with canvas-based interactive component
- Use requestAnimationFrame for smooth animation
- Lorenz attractor: dx/dt = σ(y-x), dy/dt = x(ρ-z)-y, dz/dt = xy-βz
- Standard params: σ=10, ρ=28, β=8/3
- For perturbation: add damped oscillation to trajectory when hovering
- For measurement constraint: add spring force toward mouse position when holding

### Conceptual Message

The contrast should make the physics visceral:
- **Bits**: You can point at each one and say "this one is HERE" - but they don't know about each other
- **Dynamics**: You can't isolate a single point - everything flows together. When you try to pin something down (measurement), the whole system reorganizes around your constraint
