import { notFound } from 'next/navigation';

import { IdeationPointArticleView } from '../ideation-point-article';
import { getIdeationPointBySlug } from '../ideation-points-content';

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
