import { WikiView } from '@/components/wiki/wiki-view';

export default async function WorkspaceImplementationWikiPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  return <WikiView basePath="/workspace/wiki/implementation" slugSegments={slug} />;
}
