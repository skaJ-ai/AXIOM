import { SharedWikiView } from '@/components/shared-wiki/shared-wiki-view';

export default async function PublicWikiPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;

  return (
    <SharedWikiView
      basePath="/wiki"
      buildBasePath="/wiki/implementation"
      slugSegments={slug}
    />
  );
}
