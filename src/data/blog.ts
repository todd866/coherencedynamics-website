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

// Two possible locations for blog posts:
// 1. Component folder: src/components/blog/[slug]/post.md (posts with interactive components)
// 2. Content folder: src/content/blog/[slug].md (simple posts without components)
const componentBlogDir = path.join(process.cwd(), 'src/components/blog');
const contentBlogDir = path.join(process.cwd(), 'src/content/blog');

function parsePostFile(filePath: string, slug: string): BlogPost | null {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug: data.slug || slug,
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

function getBlogPostBySlugFromDirs(slug: string): BlogPost | null {
  // First, check component folder (posts with interactive components)
  const componentPath = path.join(componentBlogDir, slug, 'post.md');
  if (fs.existsSync(componentPath)) {
    return parsePostFile(componentPath, slug);
  }

  // Fall back to content folder (simple posts)
  const contentPath = path.join(contentBlogDir, `${slug}.md`);
  if (fs.existsSync(contentPath)) {
    return parsePostFile(contentPath, slug);
  }

  return null;
}

function getAllSlugs(): string[] {
  const slugs = new Set<string>();

  // Get slugs from component folders (each folder with post.md is a blog post)
  if (fs.existsSync(componentBlogDir)) {
    const folders = fs.readdirSync(componentBlogDir, { withFileTypes: true });
    for (const folder of folders) {
      if (folder.isDirectory()) {
        const postPath = path.join(componentBlogDir, folder.name, 'post.md');
        if (fs.existsSync(postPath)) {
          slugs.add(folder.name);
        }
      }
    }
  }

  // Get slugs from content folder (simple .md files)
  if (fs.existsSync(contentBlogDir)) {
    const files = fs.readdirSync(contentBlogDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        const slug = file.replace(/\.md$/, '');
        // Don't add if already found in component folder
        if (!slugs.has(slug)) {
          slugs.add(slug);
        }
      }
    }
  }

  return Array.from(slugs);
}

export const getAllBlogPosts = (): BlogPost[] => {
  const slugs = getAllSlugs();
  const posts = slugs
    .map(slug => getBlogPostBySlugFromDirs(slug))
    .filter((post): post is BlogPost => post !== null);

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return getBlogPostBySlugFromDirs(slug) || undefined;
};

export const getBlogPostsByTag = (tag: string): BlogPost[] => {
  const posts = getAllBlogPosts();
  return posts.filter(p => p.tags.includes(tag));
};

// For static generation - get all slugs
export const getAllBlogSlugs = (): string[] => {
  return getAllSlugs();
};
