import { notFound } from 'next/navigation';

import { getIdeationPointBySlug } from '@/app/ideation-points/ideation-points-content';

import { WikiArticle } from './wiki-article';
import { WikiExplorer } from './wiki-explorer';
import { WikiOverview } from './wiki-overview';

interface WikiViewProps {
  basePath: string;
  slugSegments?: string[];
}

function WikiView({ basePath, slugSegments }: WikiViewProps) {
  const [slug, ...rest] = slugSegments ?? [];

  if (!slug) {
    return (
      <WikiExplorer basePath={basePath}>
        <WikiOverview basePath={basePath} />
      </WikiExplorer>
    );
  }

  if (rest.length > 0) {
    notFound();
  }

  const article = getIdeationPointBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <WikiExplorer basePath={basePath}>
      <WikiArticle article={article} basePath={basePath} />
    </WikiExplorer>
  );
}

export { WikiView };
export type { WikiViewProps };
