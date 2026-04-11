'use client';

import { type ChangeEvent, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { getWikiArticleHref } from '@/components/wiki/wiki-paths';

import {
  SHARED_WIKI_CATEGORY_META,
  SHARED_WIKI_CATEGORY_ORDER,
  type SharedWikiArticle,
} from './shared-wiki-content';

interface SharedWikiSidebarProps {
  articles: SharedWikiArticle[];
  basePath: string;
  buildBasePath: string;
}

const MOBILE_DRAWER_OPEN_LABEL = '목차 열기';
const MOBILE_DRAWER_CLOSE_LABEL = '닫기';

function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase();
}

function matchesSearchTerm(article: SharedWikiArticle, normalizedSearchTerm: string): boolean {
  if (normalizedSearchTerm.length === 0) {
    return true;
  }

  const searchSpace = [article.navLabel, article.summary, article.title].join(' ').toLowerCase();

  return searchSpace.includes(normalizedSearchTerm);
}

function SharedWikiSidebar({ articles, basePath, buildBasePath }: SharedWikiSidebarProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = normalizeSearchTerm(searchTerm);
  const filteredArticles = articles.filter((article) =>
    matchesSearchTerm(article, normalizedSearchTerm),
  );
  const groupedArticles = SHARED_WIKI_CATEGORY_ORDER.map((category) => ({
    articles: filteredArticles.filter((article) => article.category === category),
    category,
    meta: SHARED_WIKI_CATEGORY_META[category],
  })).filter((group) => group.articles.length > 0);
  const isOverviewActive = pathname === basePath;

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const drawerPanelClassName = `ideation-points-sidebar-panel ${isDrawerOpen ? 'is-open' : ''}`;
  const drawerOverlayClassName = `ideation-points-sidebar-overlay ${isDrawerOpen ? 'is-visible' : ''}`;

  return (
    <>
      <div className="flex items-center justify-between gap-3 xl:hidden">
        <button className="btn-secondary focus-ring" onClick={handleOpenDrawer} type="button">
          {MOBILE_DRAWER_OPEN_LABEL}
        </button>
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
          처음 읽는 사람 기준 {articles.length}개 항목
        </p>
      </div>

      <div
        aria-hidden={!isDrawerOpen}
        className={drawerOverlayClassName}
        onClick={handleCloseDrawer}
      />

      <aside className={drawerPanelClassName}>
        <div className="wiki-panel-muted flex flex-col gap-4 p-5">
          <div className="space-y-2">
            <p className="section-label">Shared Wiki</p>
            <h2 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
              팀 공유용 위키
            </h2>
            <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
              비개발자도 읽을 수 있게 제품 개념과 운영 원칙만 쉬운 말로 정리한 버전입니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="bg-white/82 rounded-[1.1rem] px-4 py-4 shadow-[var(--shadow-1)]">
              <p className="meta">ARTICLES</p>
              <p className="mt-2 font-headline text-2xl font-bold text-[var(--color-text)]">
                {articles.length}
              </p>
            </div>
            <div className="bg-white/82 rounded-[1.1rem] px-4 py-4 shadow-[var(--shadow-1)]">
              <p className="meta">VIEW</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-text)]">
                공유용 설명
              </p>
            </div>
          </div>

          <Link
            className="btn-secondary text-center text-xs"
            href={buildBasePath}
            onClick={handleCloseDrawer}
          >
            구현용 위키 보기
          </Link>
        </div>

        <div className="flex items-start justify-between gap-3 xl:hidden">
          <button className="btn-secondary focus-ring" onClick={handleCloseDrawer} type="button">
            {MOBILE_DRAWER_CLOSE_LABEL}
          </button>
        </div>

        <label className="sidebar-nav-search">
          <span className="section-label">검색</span>
          <input
            autoComplete="off"
            className="focus-ring bg-white/84 mt-2 w-full rounded-[1rem] border border-transparent px-4 py-3 text-sm text-[var(--color-text)] shadow-[var(--shadow-1)] outline-none transition placeholder:text-[var(--color-text-tertiary)]"
            onChange={handleSearchChange}
            placeholder="쉬운 설명 찾기"
            type="search"
            value={searchTerm}
          />
        </label>

        <nav className="flex flex-col gap-4">
          <Link
            className="sidebar-nav-item bg-[var(--color-accent-light)]/74 rounded-[1.25rem] px-4 py-4 shadow-[var(--shadow-1)]"
            data-active={isOverviewActive}
            href={basePath}
            onClick={handleCloseDrawer}
          >
            처음 읽는 순서
          </Link>

          {groupedArticles.map((group) => (
            <div className="wiki-panel-muted p-4" key={group.category}>
              <div className="sidebar-nav-group-header">
                <div>
                  <p className="sidebar-nav-group-title">{group.meta.label}</p>
                  <p className="sidebar-nav-group-description">{group.meta.description}</p>
                </div>
                <span className="sidebar-nav-group-count">{group.articles.length}</span>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {group.articles.map((article) => (
                  <Link
                    className="sidebar-nav-item bg-white/74 rounded-[1rem] px-4 py-3 shadow-[var(--shadow-1)]"
                    data-active={pathname === getWikiArticleHref(basePath, article.slug)}
                    href={getWikiArticleHref(basePath, article.slug)}
                    key={article.slug}
                    onClick={handleCloseDrawer}
                  >
                    {article.navLabel}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

export { SharedWikiSidebar };
export type { SharedWikiSidebarProps };
