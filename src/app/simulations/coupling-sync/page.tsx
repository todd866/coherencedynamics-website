import Link from 'next/link';
import CouplingVsMeasurementDemo from '@/components/CouplingVsMeasurementDemo';

export default function CouplingSyncPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Back link */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/simulations" className="text-gray-500 hover:text-white text-sm">
          &larr; Back to Simulations
        </Link>
      </div>

      {/* Main visualization */}
      <div className="flex flex-col items-center justify-center min-h-screen p-8 pt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Coupling Outpaces Measurement</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Systems synchronize via coupling faster than observers can detect it via measurement.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Demonstrates{' '}
            <Link href="/papers/coupling-identification" className="text-blue-400 hover:text-blue-300">
              the fundamental inequality
            </Link>
            : T<sub>sync</sub> ~ 1/|λ<sub>c</sub>| {'<<'} T<sub>meas</sub> ~ I<sub>struct</sub>/R
          </p>
          <p className="text-gray-600 text-sm mt-2">
            <a
              href="https://github.com/todd866/coherencedynamics-website/blob/main/src/components/CouplingVsMeasurementDemo.tsx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300"
            >
              View code on GitHub →
            </a>
          </p>
        </div>

        <CouplingVsMeasurementDemo className="max-w-4xl" />

        {/* Info cards below */}
        <div className="max-w-4xl mt-8 grid md:grid-cols-3 gap-4">
          <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
            <h3 className="text-sm text-green-400 mb-2">Coupling Channel</h3>
            <p className="text-gray-400 text-sm">
              Two structurally similar systems contract onto a shared synchronization manifold.
              This is a <em>physical process</em> governed by the conditional Lyapunov exponent λ<sub>c</sub>.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
            <h3 className="text-sm text-orange-400 mb-2">Measurement Channel</h3>
            <p className="text-gray-400 text-sm">
              An external observer accumulates information through bandwidth-limited sampling.
              This is an <em>inference process</em> bounded by channel capacity R.
            </p>
          </div>

          <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
            <h3 className="text-sm text-red-400 mb-2">The Blind Spot</h3>
            <p className="text-gray-400 text-sm">
              During the gap T<sub>sync</sub> {'<'} t {'<'} T<sub>meas</sub>, functional equivalence
              has been established but cannot yet be verified. The systems &ldquo;know&rdquo; each other before observers can confirm it.
            </p>
          </div>
        </div>

        {/* Additional explanation */}
        <div className="max-w-4xl mt-6 border border-gray-800 rounded-lg p-4 bg-black/50">
          <h3 className="text-sm text-cyan-400 mb-2">Why This Matters</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            This isn&apos;t just about oscillators. Whenever high-dimensional systems coordinate—neurons synchronizing,
            cells recognizing each other, immune systems detecting pathogens—there may be a regime where coordination
            outpaces external verification. The &ldquo;noise&rdquo; that generic observers discard often carries the coordination signal.
            <br /><br />
            Try reducing observer bandwidth (k) to see how limiting information access widens the blind spot.
            Try disabling coupling to see what happens without the synchronization channel.
          </p>
        </div>
      </div>
    </div>
  );
}
