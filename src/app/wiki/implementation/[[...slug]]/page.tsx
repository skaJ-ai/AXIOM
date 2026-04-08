import { WikiView } from '@/components/wiki/wiki-view';

export default async function PublicImplementationWikiPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  return <WikiView basePath="/wiki/implementation" slugSegments={slug} />;
}
