import { notFound } from 'next/navigation';

import { IdeationPointArticleView } from '../ideation-point-article';
import { IDEATION_POINT_ARTICLES, getIdeationPointBySlug } from '../ideation-points-content';

// eslint-disable-next-line @typescript-eslint/naming-convention -- Next.js route segment config
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return IDEATION_POINT_ARTICLES.map((article) => ({ slug: article.slug }));
}

export default async function IdeationPointDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getIdeationPointBySlug(slug);

  if (!article) {
    notFound();
  }

  return <IdeationPointArticleView article={article} />;
}
