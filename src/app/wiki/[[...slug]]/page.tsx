import { WikiView } from '@/components/wiki/wiki-view';

export default async function PublicWikiPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  return <WikiView basePath="/wiki" slugSegments={slug} />;
}
