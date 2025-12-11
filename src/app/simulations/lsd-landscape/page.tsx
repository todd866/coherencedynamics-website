import PsychedelicGainDemo from '@/components/PsychedelicGainDemo';
import Link from 'next/link';

export const metadata = {
  title: 'Cortical Desynchronization | Coherence Dynamics',
  description: 'Interactive simulation of psychedelic-induced cortical desynchronization. Drag to modulate 5-HT2A gain and watch oscillatory coherence collapse.',
};

export default function LSDLandscapePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        <Link
          href="/simulations"
          className="text-slate-500 hover:text-slate-300 text-sm mb-4 inline-block"
        >
          ← Back to Simulations
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2">
          The Desynchronization Engine
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Classical psychedelics don&apos;t just &quot;add noise&quot; — they systematically dismantle
          the oscillatory constraints that normally lock cortical dynamics into low-dimensional
          attractors. This simulation shows how increasing 5-HT2A receptor gain breaks synchronization
          and expands effective dimensionality.
        </p>
      </div>

      {/* Simulation */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PsychedelicGainDemo />
      </div>

      {/* Explanation */}
      <div className="max-w-4xl mx-auto px-4 py-8 border-t border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-4">The Physics</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-400">
          <div>
            <h3 className="text-slate-200 font-medium mb-2">Kuramoto Oscillators</h3>
            <p>
              Each cell represents a local cortical population with its own intrinsic frequency.
              Neighboring populations are coupled — they tend to synchronize, like pendulums on a shared beam.
              This creates the large-scale alpha waves visible at low gain.
            </p>
          </div>
          <div>
            <h3 className="text-slate-200 font-medium mb-2">5-HT2A Activation</h3>
            <p>
              Psychedelics activate 5-HT2A receptors on layer 5 pyramidal neurons, amplifying dendritic gain.
              This increases local excitability while reducing effective coupling strength — the oscillators
              &quot;break free&quot; from their synchronized attractor.
            </p>
          </div>
          <div>
            <h3 className="text-slate-200 font-medium mb-2">Coherence → Dimensionality</h3>
            <p>
              The Kuramoto order parameter R measures global synchronization. When R is high,
              most variance is captured by a few eigenmodes (low dimensionality). As R drops,
              variance spreads across many modes — effective dimensionality explodes.
            </p>
          </div>
          <div>
            <h3 className="text-slate-200 font-medium mb-2">Why It Matters</h3>
            <p>
              MEG data shows this exact pattern: psilocybin reduces oscillatory coherence by 15%,
              while ketamine (NMDA antagonist) shows no effect. This mechanism-specific dissociation
              suggests psychedelics work by dismantling cortical constraints — not just &quot;adding entropy.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Paper Link */}
      <div className="max-w-4xl mx-auto px-4 py-8 border-t border-slate-800">
        <p className="text-slate-500 text-sm">
          Companion to:{' '}
          <Link href="/papers/lsd-dimensionality" className="text-slate-300 hover:text-white">
            Psychedelics as Dimensionality Modulators
          </Link>
          {' '}(under review at Translational Psychiatry)
        </p>
      </div>
    </div>
  );
}
