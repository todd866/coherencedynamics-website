import Link from 'next/link';
import Image from 'next/image';
import { getPaperBySlug, getAdjacentPapers } from '@/data/papers';
import Markdown from '@/components/Markdown';
import PaperNavigation from '@/components/PaperNavigation';
import DimensionalCostDemo from '@/components/DimensionalCostDemo';

export default function DimensionalLandauerPage() {
  const paper = getPaperBySlug('dimensional-landauer')!;
  const { prev, next } = getAdjacentPapers('dimensional-landauer');

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
          <Link
            href="/simulations/curvature-cost"
            className="text-orange-400 hover:text-orange-300"
          >
            Full Simulation &rarr;
          </Link>
        </div>
      </div>

      {/* Interactive Hero - The Cost of Curvature Demo */}
      <section className="mb-10">
        <DimensionalCostDemo />
      </section>

      {/* Main description - first paragraph only */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-white">What&apos;s this about?</h2>
        <Markdown className="text-gray-300 leading-relaxed">
          {paper.description.split('\n\n')[0]}
        </Markdown>
      </section>

      {/* Rest of description */}
      {paper.description.split('\n\n').length > 1 && (
        <section className="mb-8">
          <Markdown className="text-gray-300 leading-relaxed">
            {paper.description.split('\n\n').slice(1).join('\n\n')}
          </Markdown>
        </section>
      )}

      {/* Static figure from paper - moved below description */}
      {paper.image && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-white">Figure from Paper</h2>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <Image
              src={`/images/papers/${paper.image}`}
              alt={paper.title}
              width={800}
              height={450}
              className="rounded-lg w-full"
            />
          </div>
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
