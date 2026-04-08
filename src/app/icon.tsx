/* eslint-disable import/no-default-export */

import { ImageResponse } from 'next/og';

export const size = {
  height: 32,
  width: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#0f4c81',
          borderRadius: 12,
          color: 'white',
          display: 'flex',
          fontSize: 18,
          fontWeight: 800,
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        HX
      </div>
    ),
    size,
  );
}
