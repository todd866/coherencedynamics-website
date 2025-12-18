import Link from 'next/link';

interface Simulation {
  slug: string;
  title: string;
  description: string;
  paper?: string;
  paperSlug?: string;
  status: 'beta' | 'playable' | 'coming_soon' | 'in_development';
}

const simulations: Simulation[] = [
  {
    slug: 'coupling-sync',
    title: 'Coupling Outpaces Measurement',
    description: "Watch two Kuramoto lattices synchronize via coupling faster than an observer can detect. The green line (coherence) rises before the orange line (observer confidence)—the gap is the 'blind spot' where sync has occurred but cannot be verified.",
    paper: 'Coupling Outpaces Measurement',
    paperSlug: 'coupling-identification',
    status: 'playable',
  },
  {
    slug: 'dimensional-collapse',
    title: 'Minimal Embedding Dimension',
    description: "Phase-preserving embeddings of cyclic processes require k ≥ 3 to remain temporally distinct. Toggle between k=3 (helix) and k=2 (circle) to see how dimensional collapse forces self-intersections.",
    paper: 'Minimal Embedding Dimension for Self-Intersection-Free Processes',
    paperSlug: 'minimal-embedding',
    status: 'playable',
  },
  {
    slug: 'code-collapse',
    title: 'Code Formation',
    description: "Two coupled dynamical systems communicating through a bandwidth-limited code. System A drives System B through a Fourier bottleneck—drag the slider to reduce bandwidth and watch B's complexity collapse while A stays complex.",
    paper: 'Low-Dimensional Codes Constrain High-D Dynamics',
    paperSlug: 'code-formation',
    status: 'playable',
  },
  {
    slug: 'lsd-landscape',
    title: 'Cortical Desynchronization (Fast Timescale)',
    description: 'At fast timescales, psychedelics break oscillatory synchronization. Drag to modulate 5-HT2A gain and watch cortical oscillators desynchronize. This shows the MEG side of the story — at slow hemodynamic timescales, the effect reverses.',
    paper: 'Timescale-Dependent Cortical Dynamics',
    paperSlug: 'lsd-dimensionality',
    status: 'playable',
  },
  {
    slug: 'bits-vs-dynamics',
    title: 'Bits vs Dynamics',
    description: "The homepage visualization. High-dimensional continuous dynamics on the left, discrete bits on the right. Drag to feel the difference between coherent and incoherent systems.",
    paper: 'High-Dimensional Coherence',
    paperSlug: 'high-dimensional-coherence',
    status: 'playable',
  },
];

const statusLabels = {
  beta: { label: 'Beta', className: 'bg-blue-900 text-blue-300' },
  playable: { label: 'Playable', className: 'bg-green-900 text-green-300' },
  in_development: { label: 'In Development', className: 'bg-yellow-900 text-yellow-300' },
  coming_soon: { label: 'Coming Soon', className: 'bg-gray-800 text-gray-400' },
};

export default function SimulationsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold mb-4 text-white">Interactive Simulations</h1>
      <p className="text-gray-400 mb-6 max-w-3xl">
        Play with the ideas. Each simulation is a companion to a research paper,
        letting you explore the concepts hands-on.
      </p>


      <div className="grid gap-6">
        {simulations.map((sim) => {
          const status = statusLabels[sim.status];
          const isPlayable = sim.status === 'playable' || sim.status === 'beta';

          const content = (
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-white">{sim.title}</h2>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-gray-400 mb-3">
                  {sim.description}
                </p>
                {sim.paper && sim.paperSlug && (
                  <p className="text-sm text-gray-500">
                    Companion to:{' '}
                    <span className="text-gray-400 hover:text-white">
                      {sim.paper}
                    </span>
                  </p>
                )}
              </div>
              {isPlayable && (
                <span className="px-4 py-2 bg-white text-black rounded-lg font-medium whitespace-nowrap">
                  Play &rarr;
                </span>
              )}
            </div>
          );

          return isPlayable ? (
            <Link
              key={sim.slug}
              href={`/simulations/${sim.slug}`}
              className="block p-6 border border-gray-800 rounded-xl hover:border-green-700 hover:bg-gray-900/50 transition-colors cursor-pointer"
            >
              {content}
            </Link>
          ) : (
            <div
              key={sim.slug}
              className="p-6 border border-gray-800 rounded-xl opacity-60"
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
