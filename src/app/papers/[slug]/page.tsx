import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { papers, getPaperBySlug, getAdjacentPapers } from '@/data/papers';
import Markdown from '@/components/Markdown';
import PaperNavigation from '@/components/PaperNavigation';
import PsychedelicGainMini from '@/components/PsychedelicGainMini';

export function generateStaticParams() {
  // Exclude papers with custom pages
  const customPages = ['dimensional-landauer'];
  return papers
    .filter((paper) => !customPages.includes(paper.slug))
    .map((paper) => ({ slug: paper.slug }));
}

export default async function PaperPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const paper = getPaperBySlug(slug);

  if (!paper) {
    notFound();
  }

  const { prev, next } = getAdjacentPapers(slug);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/papers"
        className="text-gray-400 hover:text-white mb-8 inline-block"
      >
        &larr; Back to Papers
      </Link>

      <div className={`inline-block px-2 py-1 text-xs rounded mb-4 ml-4 ${
        paper.status === 'published'
          ? 'bg-green-900 text-green-300'
          : paper.status === 'submitted'
          ? 'bg-yellow-900 text-yellow-300'
          : 'bg-gray-800 text-gray-400'
      }`}>
        {paper.status === 'published' ? 'Published' : paper.status === 'submitted' ? 'Under Review' : 'In Preparation'}
      </div>

      <h1 className="text-3xl font-bold mb-4 text-white">{paper.title}</h1>

      <div className="text-gray-400 mb-8">
        <p>{paper.journal} ({paper.year})</p>

        <div className="flex flex-wrap gap-4 mt-4">
          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300"
            >
              Published at {paper.journal} &rarr;
            </a>
          )}
          {paper.ssrn && (
            <a
              href={paper.ssrn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              SSRN Preprint &rarr;
            </a>
          )}
          {paper.github && (
            <a
              href={`https://github.com/${paper.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              GitHub &rarr;
            </a>
          )}
          {paper.pdf && (
            <a
              href={paper.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300"
            >
              PDF &rarr;
            </a>
          )}
          {paper.simulation && (
            <Link
              href={`/simulations/${paper.simulation}`}
              className="text-orange-400 hover:text-orange-300"
            >
              Try Simulation (alpha) &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Main description - first paragraph only */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-white">What&apos;s this about?</h2>
        <Markdown className="text-gray-300 leading-relaxed">
          {paper.description.split('\n\n')[0]}
        </Markdown>
      </section>

      {/* Paper image */}
      {paper.image && (
        <div className="mb-8 bg-white rounded-xl p-4 shadow-lg">
          <Image
            src={`/images/papers/${paper.image}`}
            alt={paper.title}
            width={800}
            height={450}
            className="rounded-lg w-full"
          />
        </div>
      )}

      {/* Inline simulation for lsd-dimensionality */}
      {paper.simulation === 'lsd-landscape' && (
        <section className="mb-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-3 text-white">Interactive: Cortical Desynchronization</h3>
          <p className="text-sm text-gray-400 mb-4">
            Drag left/right to modulate 5-HT2A gain. Toggle the latent signal to see how hidden patterns
            emerge when oscillatory constraints break down.
          </p>
          <div className="max-w-sm mx-auto">
            <PsychedelicGainMini />
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            <Link href="/simulations/lsd-landscape" className="text-orange-400 hover:text-orange-300">
              Open full simulation &rarr;
            </Link>
          </p>
        </section>
      )}

      {/* Rest of description */}
      {paper.description.split('\n\n').length > 1 && (
        <section className="mb-8">
          <Markdown className="text-gray-300 leading-relaxed">
            {paper.description.split('\n\n').slice(1).join('\n\n')}
          </Markdown>
        </section>
      )}

      {/* Why it matters */}
      {paper.whyItMatters && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-white">Why it matters</h2>
          <Markdown className="text-gray-300 leading-relaxed">
            {paper.whyItMatters}
          </Markdown>
        </section>
      )}

      {/* Key findings */}
      {paper.keyFindings && paper.keyFindings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-white">Key findings</h2>
          <ul className="space-y-2">
            {paper.keyFindings.map((finding, index) => (
              <li key={index} className="text-gray-300 flex items-start">
                <span className="text-gray-500 mr-3">&bull;</span>
                <Markdown className="inline">{finding}</Markdown>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Citation */}
      <section className="border-t border-gray-800 pt-8">
        <h2 className="text-xl font-semibold mb-3 text-white">Citation</h2>
        <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto text-gray-300">
{`Todd, I. (${paper.year}). ${paper.title}. ${paper.journal}.${paper.doi ? `\nhttps://doi.org/${paper.doi}` : ''}`}
        </pre>
      </section>

      {/* Workflow */}
      {paper.workflow && (
        <section className="mt-8 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Workflow:</span> {paper.workflow}
          </p>
        </section>
      )}

      {/* Prev/Next Navigation */}
      <PaperNavigation
        prev={prev ? { slug: prev.slug, title: prev.title } : null}
        next={next ? { slug: next.slug, title: next.title } : null}
      />
    </main>
  );
}
