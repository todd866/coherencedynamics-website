import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPaperBySlug } from '@/data/papers';
import { getFullPaperContent } from '@/data/full-papers';
import Markdown from '@/components/Markdown';

export function generateStaticParams() {
  // Only generate for papers that have full content
  const papersWithFullContent = ['information-credit'];
  return papersWithFullContent.map((slug) => ({ slug }));
}

export default async function FullPaperPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const paper = getPaperBySlug(slug);
  const fullContent = getFullPaperContent(slug);

  if (!paper || !fullContent) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href={`/papers/${slug}`}
        className="text-gray-400 hover:text-white mb-8 inline-block"
      >
        &larr; Back to summary
      </Link>

      <article className="prose prose-invert prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-2 text-white">{paper.title}</h1>

        <p className="text-gray-400 mb-8">
          Ian Todd<br />
          Sydney Medical School, University of Sydney, Australia
        </p>

        {/* Abstract */}
        <section className="mb-12 p-6 bg-gray-900 rounded-lg border border-gray-800">
          <h2 className="text-lg font-semibold text-gray-400 mb-3 mt-0">Abstract</h2>
          <Markdown className="text-gray-300">{fullContent.abstract}</Markdown>
        </section>

        {/* Sections */}
        {fullContent.sections.map((section, index) => (
          <section key={index} className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
            <Markdown className="text-gray-300 leading-relaxed">
              {section.content}
            </Markdown>
          </section>
        ))}

        {/* References */}
        {fullContent.references && (
          <section className="mt-12 pt-8 border-t border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-4">References</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
              {fullContent.references.map((ref, index) => (
                <li key={index}>{ref}</li>
              ))}
            </ol>
          </section>
        )}

        {/* Download PDF */}
        <section className="mt-12 pt-8 border-t border-gray-800 text-center">
          {paper.pdf && (
            <a
              href={paper.pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Download PDF
            </a>
          )}
          {paper.github && (
            <a
              href={`https://github.com/${paper.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 ml-4 text-gray-400 hover:text-white transition-colors"
            >
              View on GitHub &rarr;
            </a>
          )}
        </section>
      </article>

      {/* Workflow */}
      {paper.workflow && (
        <section className="mt-8 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            <span className="font-medium">Workflow:</span> {paper.workflow}
          </p>
        </section>
      )}
    </main>
  );
}
