import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StampStack } from '../src/index'
import '../src/styles.css'

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
  // Text content with NO hardcoded color — it inherits --stampstack-text from the
  // library, which flips light/dark with the theme. (The muted count uses opacity,
  // not a fixed color, so it stays theme-agnostic.)
  return (
    <StampStack
      items={cities}
      renderStamp={(city) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 4,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <strong style={{ fontSize: 20 }}>{city.name}</strong>
          <span style={{ fontSize: 12, opacity: 0.55 }}>{city.courts} Courts</span>
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
