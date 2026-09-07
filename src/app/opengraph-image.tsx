import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CadorDigital - Build. Market. Automate. Grow.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 50%, #0A1628 100%)',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#C9A84C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 800,
            }}
          >
            C
          </div>
          <span style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.1em' }}>CADORDIGITAL</span>
        </div>
        <div style={{ fontSize: '64px', fontWeight: 800, lineHeight: 1.1 }}>
          <div>Build. Market.</div>
          <div style={{ color: '#C9A84C' }}>Automate. Grow.</div>
        </div>
        <div style={{ fontSize: '20px', opacity: 0.7, marginTop: '20px', maxWidth: '700px', lineHeight: 1.5 }}>
          Professional brands, websites, marketing systems and automation solutions in Tanzania.
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', fontSize: '14px', opacity: 0.6 }}>
          <span>cador.digital</span>
          <span>•</span>
          <span>Dar es Salaam, Tanzania</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
