import { WikiView } from '@/components/wiki/wiki-view';

export default async function WorkspaceWikiPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  return <WikiView basePath="/workspace/wiki" slugSegments={slug} />;
}
