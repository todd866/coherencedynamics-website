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
