import PsychedelicGainDemo from '@/components/PsychedelicGainDemo';
import Link from 'next/link';

export const metadata = {
  title: 'Cortical Desynchronization (Fast Timescale) | Coherence Dynamics',
  description: 'Interactive simulation of fast-timescale cortical desynchronization under psychedelics. Drag to modulate 5-HT2A gain and watch oscillators desynchronize.',
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
          Cortical Desynchronization (Fast Timescale)
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          This demo illustrates the <strong>fast-timescale</strong> effect of serotonergic psychedelics:
          increasing gain weakens synchronization in a coupled oscillator field, spreading activity
          across more independent modes (MEG-like D<sub>eff</sub> increase). The companion paper shows
          this is only half the story — at slow hemodynamic timescales, the observed BOLD covariance
          can become <em>more</em> low-dimensional, even after global signal removal.
        </p>
      </div>

      {/* Simulation */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PsychedelicGainDemo />
      </div>

      {/* Fast vs Slow callout */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-amber-400 font-medium">Fast (MEG-like):</span>
              <span className="text-slate-300 ml-2">D<sub>eff</sub> ↑ — more independent oscillatory modes</span>
            </div>
            <div>
              <span className="text-blue-400 font-medium">Slow (fMRI BOLD):</span>
              <span className="text-slate-300 ml-2">D<sub>eff</sub> ↓, PC1 ↑ — more shared variance (survives GSR)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="max-w-4xl mx-auto px-4 py-8 border-t border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-4">What This Demo Shows</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-400">
          <div>
            <h3 className="text-slate-200 font-medium mb-2">Kuramoto Oscillators (Fast Layer)</h3>
            <p>
              Each cell represents a local cortical population with its own intrinsic frequency.
              Neighboring populations are coupled — they tend to synchronize, like pendulums on a shared beam.
              This creates the large-scale waves visible at low gain.
            </p>
          </div>
          <div>
            <h3 className="text-slate-200 font-medium mb-2">Gain Modulation (Psychedelic Intuition)</h3>
            <p>
              5-HT2A agonism is often modeled as increased dendritic gain. In a coupled oscillator system,
              higher gain can amplify local perturbations, weakening phase-locking and promoting
              desynchronization.
            </p>
          </div>
          <div>
            <h3 className="text-slate-200 font-medium mb-2">What We Measure Here</h3>
            <p>
              The live metric shown is the Kuramoto order parameter R (global synchrony). Lower R means
              less global phase-locking. This demo is a conceptual illustration of the fast
              electrophysiological regime.
            </p>
          </div>
          <div>
            <h3 className="text-slate-200 font-medium mb-2">What This Demo Is Not</h3>
            <p>
              This is <strong>not</strong> a hemodynamic forward model and does not simulate BOLD.
              In the companion paper, slow fMRI covariance shifts in the <em>opposite</em> direction
              (PC1 ↑, D<sub>eff</sub> ↓) despite fast desynchronization. The lesson: dimensionality
              depends on timescale and measurement channel.
            </p>
          </div>
        </div>
      </div>

      {/* What the paper found */}
      <div className="max-w-4xl mx-auto px-4 py-8 border-t border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-4">What the Paper Found</h2>
        <div className="text-sm text-slate-400 space-y-3">
          <p>
            In MEG analyses, serotonergic psychedelics show increased effective dimensionality
            (D<sub>eff</sub> +15%, p = 0.003), consistent with reduced synchronization at fast timescales.
            Ketamine (NMDA antagonist) does not show the same directional change.
          </p>
          <p>
            The key result: the slow hemodynamic channel behaves differently. In a precision-mapping
            psilocybin fMRI dataset, covariance becomes <em>more</em> low-dimensional
            (D<sub>eff</sub> −10%, PC1 ↑), and this persists after global signal regression (p = 0.036).
          </p>
          <p className="text-slate-500 italic">
            &quot;Psychedelic entropy&quot; is observation-operator dependent, not a single brain-wide scalar.
          </p>
        </div>
      </div>

      {/* Paper Link */}
      <div className="max-w-4xl mx-auto px-4 py-8 border-t border-slate-800">
        <p className="text-slate-500 text-sm">
          Companion to:{' '}
          <Link href="/papers/lsd-dimensionality" className="text-slate-300 hover:text-white">
            Timescale-Dependent Cortical Dynamics: Psychedelics Desynchronize Fast Oscillations
            While Concentrating Slow Hemodynamic Variance
          </Link>
        </p>
      </div>
    </div>
  );
}
