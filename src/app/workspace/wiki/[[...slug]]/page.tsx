import { SharedWikiView } from '@/components/shared-wiki/shared-wiki-view';

export default async function WorkspaceWikiPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  return (
    <SharedWikiView
      basePath="/workspace/wiki"
      buildBasePath="/workspace/wiki/implementation"
      slugSegments={slug}
    />
  );
}
