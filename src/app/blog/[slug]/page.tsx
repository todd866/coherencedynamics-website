import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts, getBlogPostBySlug } from '@/data/blog';
import { getPaperBySlug } from '@/data/papers';
import Markdown from '@/components/Markdown';

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPapers = post.relatedPapers
    ?.map(slug => getPaperBySlug(slug))
    .filter(Boolean);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link
        href="/blog"
        className="text-gray-400 hover:text-white mb-8 inline-block"
      >
        &larr; Back to Blog
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl font-bold mb-2 text-white">{post.title}</h1>

          {post.subtitle && (
            <p className="text-xl text-gray-400 italic mb-4">{post.subtitle}</p>
          )}

          <p className="text-gray-500">{formatDate(post.date)}</p>
        </header>

        <div className="prose prose-invert prose-lg max-w-none">
          <Markdown className="text-gray-300 leading-relaxed blog-content">
            {post.content}
          </Markdown>
        </div>

        {relatedPapers && relatedPapers.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-white">Related Papers</h2>
            <div className="space-y-3">
              {relatedPapers.map(paper => paper && (
                <Link
                  key={paper.slug}
                  href={`/papers/${paper.slug}`}
                  className="block p-4 border border-gray-800 rounded-lg hover:border-gray-600 hover:bg-gray-900/50 transition-colors"
                >
                  <h3 className="font-medium text-white">{paper.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {paper.journal} ({paper.year})
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
