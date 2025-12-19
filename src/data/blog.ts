import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  subtitle?: string;
  date: string; // ISO date string
  tags: string[];
  summary: string;
  content: string; // Markdown content
  relatedPapers?: string[]; // slugs of related papers
}

const blogDirectory = path.join(process.cwd(), 'src/content/blog');

function getBlogPostFromFile(filename: string): BlogPost | null {
  const filePath = path.join(blogDirectory, filename);

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug: data.slug || filename.replace(/\.md$/, ''),
      title: data.title,
      subtitle: data.subtitle,
      date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date,
      tags: data.tags || [],
      summary: data.summary,
      content: content.trim(),
      relatedPapers: data.relatedPapers,
    };
  } catch {
    return null;
  }
}

export const getAllBlogPosts = (): BlogPost[] => {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const filenames = fs.readdirSync(blogDirectory);
  const posts = filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => getBlogPostFromFile(filename))
    .filter((post): post is BlogPost => post !== null);

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  const posts = getAllBlogPosts();
  return posts.find(p => p.slug === slug);
};

export const getBlogPostsByTag = (tag: string): BlogPost[] => {
  const posts = getAllBlogPosts();
  return posts.filter(p => p.tags.includes(tag));
};

// For static generation - get all slugs
export const getAllBlogSlugs = (): string[] => {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const filenames = fs.readdirSync(blogDirectory);
  return filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const post = getBlogPostFromFile(filename);
      return post?.slug || filename.replace(/\.md$/, '');
    });
};
