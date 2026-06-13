export function Footer() {
  // Server component → these evaluate at build time, so "Last updated" reflects
  // the most recent deploy and auto-advances on every build.
  const now = new Date()
  const year = now.getFullYear()
  const lastUpdated = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <footer
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 96,
        alignItems: 'flex-start',
        width: '100%',
        marginTop: 80,
      }}
    >
      {/* Outro block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 41, width: '100%' }}>
        {/* "Outro" label + hairline */}
        <div style={{ display: 'flex', gap: 15, alignItems: 'center', width: '100%' }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 500,
              fontSize: 12,
              lineHeight: '20px',
              letterSpacing: '-0.2px',
              color: '#252525',
              whiteSpace: 'nowrap',
            }}
          >
            Outro
          </span>
          <div style={{ flex: 1, height: 1, background: '#f5f5f5' }} />
        </div>

        {/* Note + acknowledgements */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            maxWidth: 560,
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            fontSize: 13,
            letterSpacing: '-0.1px',
            color: '#989897',
          }}
        >
          <div>
            <p style={{ margin: 0, lineHeight: '24px' }}>
              I first used stampstack on a tennis court directory project i launched in may 2026.
            </p>
            <p style={{ margin: 0, lineHeight: '24px' }}>
              A number of people really liked it so i turned it into a simple reusable component for
              anybody to install.
              <br aria-hidden />
              More customization soon xx
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 380 }}>
            <p style={{ margin: 0, lineHeight: '24px' }}>Acknowledgements</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <p style={{ margin: 0, lineHeight: '24px' }}>
                Drag / flick release behavior adapted from{' '}
                <a
                  className="link-quiet"
                  href="https://swiperjs.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Swiper
                </a>
                ’s coverflow.
              </p>
              <p style={{ margin: 0, lineHeight: '24px' }}>API shape inspired by cobe.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
        <div style={{ height: 1, background: '#f5f5f5', width: '100%' }} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            fontSize: 12,
            lineHeight: '20px',
            letterSpacing: 'normal',
            color: '#484747',
          }}
        >
          <span>
            ©  {year} Made by{' '}
            <a
              className="link-plain"
              href="https://x.com/lottabydesign"
              target="_blank"
              rel="noreferrer"
            >
              Lota Anidi
            </a>
          </span>
          <span style={{ textAlign: 'right' }}>Last updated: {lastUpdated}</span>
        </div>
      </div>
    </footer>
  )
}
