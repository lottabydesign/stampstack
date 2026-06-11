import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StampStack } from '../src/index'
import '../src/styles.css'

// A consumer-defined palette — proving colors live in consumer-land, not the library.
const PALETTE = ['#295df6', '#c6a0fd', '#5cd500', '#ff7a45', '#ff3e8c', '#00c9a7']
function colorFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

const cities = [
  { id: 'lagos', name: 'Lagos', courts: 12 },
  { id: 'abuja', name: 'Abuja', courts: 7 },
  { id: 'kano', name: 'Kano', courts: 3 },
  { id: 'ibadan', name: 'Ibadan', courts: 5 },
  { id: 'phc', name: 'Port Harcourt', courts: 4 },
  { id: 'benin', name: 'Benin City', courts: 6 },
  { id: 'kaduna', name: 'Kaduna', courts: 4 },
  { id: 'enugu', name: 'Enugu', courts: 5 },
  { id: 'jos', name: 'Jos', courts: 2 },
  { id: 'ilorin', name: 'Ilorin', courts: 3 },
  { id: 'owerri', name: 'Owerri', courts: 4 },
  { id: 'calabar', name: 'Calabar', courts: 2 },
  { id: 'uyo', name: 'Uyo', courts: 3 },
  { id: 'abeokuta', name: 'Abeokuta', courts: 5 },
]

function App() {
  return (
    <StampStack
      items={cities}
      // Per-stamp frame color, decided in consumer-land from our own data.
      frameColor={(city) => colorFor(city.id)}
      renderStamp={(city, state) => (
        // Full-bleed photo on the white paper, with a caption over the bottom.
        // The library's content slot clips this to the rounded inner-card shape.
        <div style={{ position: 'relative', height: '100%', opacity: state.focused ? 1 : 0.9 }}>
          <img
            src={`https://picsum.photos/seed/${city.id}/400/480`}
            alt={city.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              padding: '12px 14px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.65))',
              color: '#fff',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            <strong style={{ fontSize: 18, display: 'block', lineHeight: 1.1 }}>{city.name}</strong>
            <span style={{ fontSize: 12, opacity: 0.9 }}>{city.courts} Courts</span>
          </div>
        </div>
      )}
    />
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
