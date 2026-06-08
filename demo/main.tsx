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
]

function App() {
  return (
    <StampStack
      items={cities}
      onSelect={(c) => alert(`Open ${c.name}`)}
      renderStamp={(city, state) => (
        <div
          style={{
            // The consumer styles the FRAME color per-stamp from its own data:
            ['--stampstack-frame' as string]: colorFor(city.id),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            opacity: state.focused ? 1 : 0.85,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <strong style={{ fontSize: 20, color: '#404040' }}>{city.name}</strong>
          <span style={{ fontSize: 12, color: '#888' }}>{city.courts} Courts</span>
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
