import type { ReactNode } from 'react';

import Link from 'next/link';

import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

interface AuthShellProps {
  children: ReactNode;
  description: string;
  linkHref: string;
  linkLabel: string;
  linkText: string;
  title: string;
}

function AuthShell({
  children,
  description,
  linkHref,
  linkLabel,
  linkText,
  title,
}: AuthShellProps) {
  return (
    <div className="surface flex w-full max-w-md flex-col gap-8 p-8 shadow-[var(--shadow-2)]">
      <div className="flex flex-col gap-3">
        <span className="section-label">{BRAND_NAME}</span>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">{title}</h1>
        <p className="text-xs leading-5 text-[var(--color-text-tertiary)]">{BRAND_TAGLINE}</p>
        <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
      </div>
      {children}
      <p className="text-sm text-[var(--color-text-secondary)]">
        {linkLabel}{' '}
        <Link className="font-semibold text-[var(--color-accent)] hover:underline" href={linkHref}>
          {linkText}
        </Link>
      </p>
    </div>
  );
}

export { AuthShell };
