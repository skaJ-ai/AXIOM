'use client';

import { type ChangeEvent, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  IDEATION_POINT_CATEGORY_META,
  IDEATION_POINT_CATEGORY_ORDER,
  type IdeationPointArticle,
} from '@/app/ideation-points/ideation-points-content';

import { getWikiArticleHref } from './wiki-paths';

interface WikiSidebarProps {
  articles: IdeationPointArticle[];
  basePath: string;
}

const MOBILE_DRAWER_OPEN_LABEL = '목차 열기';
const MOBILE_DRAWER_CLOSE_LABEL = '닫기';

function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase();
}

function matchesSearchTerm(article: IdeationPointArticle, normalizedSearchTerm: string): boolean {
  if (normalizedSearchTerm.length === 0) {
    return true;
  }

  const searchSpace = [article.navLabel, article.summary, article.title].join(' ').toLowerCase();

  return searchSpace.includes(normalizedSearchTerm);
}

function WikiSidebar({ articles, basePath }: WikiSidebarProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const normalizedSearchTerm = normalizeSearchTerm(searchTerm);
  const filteredArticles = articles.filter((article) =>
    matchesSearchTerm(article, normalizedSearchTerm),
  );
  const groupedArticles = IDEATION_POINT_CATEGORY_ORDER.map((category) => ({
    articles: filteredArticles.filter((article) => article.category === category),
    category,
    meta: IDEATION_POINT_CATEGORY_META[category],
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
          카테고리별로 묶인 {articles.length}개 항목
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
            <p className="section-label">Reading Console</p>
            <h2 className="font-headline text-2xl font-bold tracking-tight text-[var(--color-text)]">
              HR AX 플랫폼 위키
            </h2>
            <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
              설계 판단과 운영 원칙을 카테고리로 묶어 읽고, 필요하면 검색으로 바로 진입합니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.1rem] bg-white/82 px-4 py-4 shadow-[var(--shadow-1)]">
              <p className="meta">VISIBLE</p>
              <p className="mt-2 font-headline text-2xl font-bold text-[var(--color-text)]">
                {filteredArticles.length}
              </p>
            </div>
            <div className="rounded-[1.1rem] bg-white/82 px-4 py-4 shadow-[var(--shadow-1)]">
              <p className="meta">TOTAL</p>
              <p className="mt-2 font-headline text-2xl font-bold text-[var(--color-text)]">
                {articles.length}
              </p>
            </div>
            <div className="rounded-[1.1rem] bg-white/82 px-4 py-4 shadow-[var(--shadow-1)]">
              <p className="meta">GROUPS</p>
              <p className="mt-2 font-headline text-2xl font-bold text-[var(--color-text)]">
                {groupedArticles.length}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 xl:hidden">
          <button
            className="btn-secondary focus-ring"
            onClick={handleCloseDrawer}
            type="button"
          >
            {MOBILE_DRAWER_CLOSE_LABEL}
          </button>
        </div>

        <label className="sidebar-nav-search">
          <span className="section-label">검색</span>
          <input
            autoComplete="off"
            className="focus-ring mt-2 w-full rounded-[1rem] border border-transparent bg-white/84 px-4 py-3 text-sm text-[var(--color-text)] outline-none shadow-[var(--shadow-1)] transition placeholder:text-[var(--color-text-tertiary)]"
            onChange={handleSearchChange}
            placeholder="항목 검색"
            type="search"
            value={searchTerm}
          />
        </label>

        <nav className="flex flex-col gap-4">
          <Link
            className="sidebar-nav-item rounded-[1.25rem] bg-[var(--color-accent-light)]/74 px-4 py-4 shadow-[var(--shadow-1)]"
            data-active={isOverviewActive}
            href={basePath}
            onClick={handleCloseDrawer}
          >
            위키 개요
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
                    className="sidebar-nav-item rounded-[1rem] bg-white/74 px-4 py-3 shadow-[var(--shadow-1)]"
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

          {groupedArticles.length === 0 ? (
            <div className="sidebar-nav-empty">
              <p className="font-semibold text-[var(--color-text)]">검색 결과가 없습니다.</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                다른 키워드로 다시 찾아보거나 개요에서 읽는 순서를 확인하세요.
              </p>
            </div>
          ) : null}
        </nav>
      </aside>
    </>
  );
}

export { WikiSidebar };
export type { WikiSidebarProps };
