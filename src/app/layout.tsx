import type { ReactNode } from 'react';

import type { Metadata } from 'next';

import { BRAND_DESCRIPTION, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

import './globals.css';

const metadata: Metadata = {
  description: BRAND_DESCRIPTION,
  icons: {
    icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="%230f4c81"/><text x="50" y="68" text-anchor="middle" font-size="56" font-family="Arial" font-weight="700" fill="white">A</text></svg>`,
  },
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
