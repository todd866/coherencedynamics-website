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
    slug: 'code-collapse',
    title: 'Dimensional Collapse → Code',
    description: "Watch a 4D tesseract collapse into lines of code. Drag the slider to crush dimensions—see how chaotic 3D geometry snaps into flat rows of syntax. Code is just a 2D slice of higher-dimensional thought.",
    paper: 'High-Dimensional Coherence',
    paperSlug: 'high-dimensional-coherence',
    status: 'playable',
  },
  {
    slug: 'dimensional-collapse',
    title: '4D Tesseract Shadow',
    description: "Watch a 4-dimensional hypercube projected to your screen. Drag to rotate through 4D space and see how the 3D 'shadow' morphs—demonstrating how dimensional collapse creates apparent complexity from simple structure.",
    paper: 'High-Dimensional Coherence',
    paperSlug: 'high-dimensional-coherence',
    status: 'playable',
  },
  {
    slug: 'bits-vs-dynamics',
    title: 'Bits vs Dynamics',
    description: "Compare two kinds of systems: billiard balls (bits) that lose energy at every collision, versus a Lorenz attractor (dynamics) that never settles but stays bounded. See the fundamental trade-off between addressability and coherence.",
    paper: 'Dimensional Landauer Bound',
    paperSlug: 'dimensional-landauer',
    status: 'playable',
  },
  {
    slug: 'maxwells-ledger',
    title: "Maxwell's Ledger",
    description: "Watch two systems process the same signal: a digital computer paying energy for every bit, versus a biological system that defers costs until commitment. See why 10^50 paths can collapse to the same output.",
    paper: "Timing Inaccessibility",
    paperSlug: 'timing-inaccessibility',
    status: 'playable',
  },
  {
    slug: 'symptoms-please',
    title: 'Symptoms Please',
    description: 'A Papers Please-style game about clinical decision-making. Process patients, order tests, make diagnoses. Learn why high test sensitivity doesn\'t mean high diagnostic accuracy.',
    paper: 'Clinical Validity Bounds',
    paperSlug: 'clinical-validity-bounds',
    status: 'in_development',
  },
  {
    slug: 'fractal-warcraft',
    title: 'FractalCraft',
    description: 'A turn-based strategy game demonstrating nonergodic development. Watch units evolve under environmental pressure while cells decohere under the same stress.',
    paper: 'Nonergodic Development',
    paperSlug: 'nonergodic-development',
    status: 'in_development',
  },
  {
    slug: 'lsd-landscape',
    title: 'LSD Landscape',
    description: 'Explore effective dimensionality in altered states. Visualize how psychedelics might expand the accessible state space.',
    paper: 'LSD Dimensionality',
    paperSlug: 'lsd-dimensionality',
    status: 'coming_soon',
  },
  {
    slug: 'coherence-helix',
    title: 'Coherence Helix',
    description: 'Visualize the minimal embedding theorem. See why cyclic decision processes require at least 3 dimensions to avoid collisions.',
    paper: 'Minimal Embedding',
    paperSlug: 'minimal-embedding',
    status: 'coming_soon',
  },
  {
    slug: 'protein-observer',
    title: 'Protein Observer',
    description: 'Try to measure a folding protein. Watch as each observation disturbs the conformational state. See why high-dimensional systems resist binary hypothesis testing.',
    paper: 'The Limits of Falsifiability',
    paperSlug: 'falsifiability',
    status: 'beta',
  },
];

const statusLabels = {
  beta: { label: 'Beta', className: 'bg-blue-900 text-blue-300' },
  playable: { label: 'Alpha', className: 'bg-amber-900 text-amber-300' },
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

      {/* Early Alpha notice */}
      <div className="mb-12 p-4 border border-amber-700/50 bg-amber-900/20 rounded-lg">
        <p className="text-amber-400 text-sm">
          <span className="font-semibold">Early Alpha</span> — These simulations are rough works-in-progress.
          Expect bugs, placeholder graphics, and incomplete features. We&apos;re building in public.
        </p>
      </div>

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
