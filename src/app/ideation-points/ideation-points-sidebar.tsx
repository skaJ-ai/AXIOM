'use client';

import { type ChangeEvent, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  IDEATION_POINT_CATEGORY_META,
  IDEATION_POINT_CATEGORY_ORDER,
  type IdeationPointArticle,
} from './ideation-points-content';

interface IdeationPointsSidebarProps {
  articles: IdeationPointArticle[];
}

const IDEATION_POINTS_ROOT_PATH = '/ideation-points';
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

function IdeationPointsSidebar({ articles }: IdeationPointsSidebarProps) {
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
  const isOverviewActive = pathname === IDEATION_POINTS_ROOT_PATH;

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
      <div className="flex items-center justify-between gap-3 lg:hidden">
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
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-4">
          <div className="flex flex-col gap-2">
            <p className="section-label">위키 내비게이션</p>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              개념 축으로 묶어 읽고, 필요하면 검색으로 바로 진입합니다.
            </p>
          </div>

          <button
            className="btn-secondary focus-ring lg:hidden"
            onClick={handleCloseDrawer}
            type="button"
          >
            {MOBILE_DRAWER_CLOSE_LABEL}
          </button>
        </div>

        <label className="sidebar-nav-search mt-4">
          <span className="section-label">검색</span>
          <input
            autoComplete="off"
            className="focus-ring mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-tertiary)]"
            onChange={handleSearchChange}
            placeholder="항목 검색"
            type="search"
            value={searchTerm}
          />
        </label>

        <nav className="mt-5 flex flex-col gap-4">
          <Link
            className="sidebar-nav-item"
            data-active={isOverviewActive}
            href={IDEATION_POINTS_ROOT_PATH}
            onClick={handleCloseDrawer}
          >
            위키 개요
          </Link>

          {groupedArticles.map((group) => (
            <div className="sidebar-nav-group" key={group.category}>
              <div className="sidebar-nav-group-header">
                <div>
                  <p className="sidebar-nav-group-title">{group.meta.label}</p>
                  <p className="sidebar-nav-group-description">{group.meta.description}</p>
                </div>
                <span className="sidebar-nav-group-count">{group.articles.length}</span>
              </div>

              <div className="mt-2 flex flex-col gap-1">
                {group.articles.map((article) => (
                  <Link
                    className="sidebar-nav-item"
                    data-active={pathname === `${IDEATION_POINTS_ROOT_PATH}/${article.slug}`}
                    href={`${IDEATION_POINTS_ROOT_PATH}/${article.slug}`}
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

export { IdeationPointsSidebar };
export type { IdeationPointsSidebarProps };
