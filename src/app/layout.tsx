import type { ReactNode } from 'react';

import type { Metadata } from 'next';

import { BRAND_DESCRIPTION, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

import './globals.css';

const metadata: Metadata = {
  description: BRAND_DESCRIPTION,
  title: `${BRAND_NAME} — ${BRAND_TAGLINE}`,
};

export { metadata };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
