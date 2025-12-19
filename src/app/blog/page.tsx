import Link from 'next/link';
import { getAllBlogPosts, BlogPost } from '@/data/blog';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block p-6 border border-gray-800 rounded-lg hover:border-gray-600 hover:bg-gray-900/50 transition-colors"
    >
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
      {post.subtitle && (
        <p className="text-gray-400 text-sm mb-3 italic">{post.subtitle}</p>
      )}
      <p className="text-gray-300 mb-4">{post.summary}</p>
      <p className="text-gray-500 text-sm">{formatDate(post.date)}</p>
    </Link>
  );
}

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Blog</h1>
        <p className="text-gray-400 mb-12">
          Essays on consciousness, computation, and the physics of biological intelligence.
        </p>

        <div className="space-y-6">
          {posts.map(post => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <p className="text-gray-500 text-center py-12">
            No posts yet. Check back soon.
          </p>
        )}
      </div>
    </main>
  );
}
