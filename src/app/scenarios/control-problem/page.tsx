/**
 * Control Problem Scenario Page
 *
 * Loads the story bundle and renders the scrollytelling experience.
 */

import StoryPlayer from '@/components/StoryPlayer';
import { StoryBundle } from '@/lib/types';
import { promises as fs } from 'fs';
import path from 'path';

// Load the story bundle at build time
async function getStoryBundle(): Promise<StoryBundle> {
  // Read directly from public folder for server-side rendering
  const filePath = path.join(process.cwd(), 'public', 'stories', 'control-problem.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

export default async function ControlProblemPage() {
  let bundle: StoryBundle;

  try {
    bundle = await getStoryBundle();
  } catch {
    // Fallback for development - show instructions
    return (
      <main className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-4">Control Problem</h1>
        <div className="bg-red-900/30 border border-red-500 p-4 rounded">
          <p className="mb-2">Story bundle not found.</p>
          <p className="text-sm text-gray-400">
            Run this command to generate it:
          </p>
          <pre className="bg-black/50 p-2 mt-2 text-sm overflow-x-auto">
            cd coherence-engine{'\n'}
            python -m simulations.control_problem.story.export web/public/stories/control-problem.json
          </pre>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <StoryPlayer bundle={bundle} />
    </main>
  );
}

export const metadata = {
  title: 'Control Problem | Coherence Dynamics',
  description: 'A scrollytelling experience about a hypersonic cargo plane, illegal AI, and a Pacific with nowhere to land.',
};
