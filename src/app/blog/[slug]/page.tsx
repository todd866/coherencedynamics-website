import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllBlogSlugs, getBlogPostBySlug } from '@/data/blog';
import { getPaperBySlug } from '@/data/papers';
import Markdown from '@/components/Markdown';
import SoupVsSparks from '@/components/SoupVsSparks';
// Quantum mechanics blog post components
import {
  QuantumEraserDemo,
  DoubleSlitDiagram,
  DelayedChoiceDiagram,
  ProjectionDiagram,
  DimensionalCollapse,
  HilbertProjectionDemo,
  NoncommutationDemo,
} from '@/components/blog/quantum-mechanics-without-math';
// Quantum gravity blog post components
import {
  GravityWellDemo,
  DimensionalBottleneckDemo,
} from '@/components/blog/quantum-gravity-without-the-paradox';
// Time from dimensions blog post components
import { TimeApertureDemo } from '@/components/blog/time-from-dimensions';
// Series keyboard navigation
import SeriesNavigation from '@/components/blog/SeriesNavigation';

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Simulation embed configurations
const simulationEmbeds: Record<string, {
  component: React.ReactNode;
  caption: string;
  link: string;
}> = {
  'soup-vs-sparks': {
    component: <SoupVsSparks />,
    caption: 'Left: Coupled oscillators synchronize spontaneously. Right: Independent switches show no coordination.',
    link: '/simulations/soup-vs-sparks',
  },
  'quantum-eraser': {
    component: <QuantumEraserDemo />,
    caption: 'Toy simulation of postselection. Click to filter by detector outcome — the data never changes, only which subset you highlight.',
    link: '/simulations/quantum-eraser',
  },
  'dimensional-collapse': {
    component: <DimensionalCollapse />,
    caption: 'A 3D helix projects to a circle (top) or sine wave (side). The crossings are projection artifacts.',
    link: '/simulations/dimensional-collapse',
  },
  'double-slit': {
    component: <DoubleSlitDiagram />,
    caption: 'The classic double-slit experiment. Click to add or remove which-path detectors.',
    link: '',
  },
  'delayed-choice': {
    component: <DelayedChoiceDiagram />,
    caption: 'Step through the delayed-choice quantum eraser experiment.',
    link: '',
  },
  'projection': {
    component: <ProjectionDiagram />,
    caption: 'The same 3D object looks completely different from different angles.',
    link: '',
  },
  'hilbert-projection': {
    component: <HilbertProjectionDemo />,
    caption: 'Toy model of a 2D Hilbert space. Measurement is projection; probability is the squared length of the projected vector.',
    link: '',
  },
  'noncommutation': {
    component: <NoncommutationDemo />,
    caption: 'Toy qubit model. Try measuring Z then X, vs X then Z — the order determines the outcomes.',
    link: '',
  },
  // Quantum gravity blog post
  'gravity-well': {
    component: <GravityWellDemo />,
    caption: 'Two views: gravity couples to classical particle positions (paradox) or to the quantum mass-energy distribution (stable).',
    link: '',
  },
  'dimensional-bottleneck': {
    component: <DimensionalBottleneckDemo />,
    caption: 'High-dimensional dynamics squeezed through a 3D aperture, then diffracting into entanglement.',
    link: '',
  },
  // Time from dimensions blog post
  'time-aperture': {
    component: <TimeApertureDemo />,
    caption: 'Squeeze the aperture → reduce state-space exploration → slow the system clock relative to external time.',
    link: '',
  },
};

function BlogContent({ content }: { content: string }) {
  // Find all simulation embeds
  const simRegex = /<!-- SIMULATION: ([\w-]+) -->/g;
  const parts: (string | { sim: string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = simRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push({ sim: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return (
    <>
      {parts.map((part, i) => {
        if (typeof part === 'string') {
          return (
            <Markdown key={i} className="text-gray-300 leading-relaxed blog-content">
              {part}
            </Markdown>
          );
        }
        const embed = simulationEmbeds[part.sim];
        if (!embed) {
          return (
            <div key={i} className="my-8 p-4 bg-gray-900 border border-gray-700 rounded text-gray-500 text-center">
              Simulation &quot;{part.sim}&quot; not found
            </div>
          );
        }
        return (
          <div key={i} className="my-8 not-prose">
            <div className="border border-gray-800 rounded-lg p-4 bg-black/50">
              {embed.component}
              <p className="text-gray-500 text-xs mt-3 text-center">
                {embed.caption}
                {embed.link && (
                  <>
                    <br />
                    <Link href={embed.link} className="text-gray-400 hover:text-white">
                      Open full simulation →
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
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
      <SeriesNavigation />
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
          <BlogContent content={post.content} />
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
