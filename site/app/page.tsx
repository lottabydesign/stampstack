import { Hero } from '@/components/Hero'
import { Section } from '@/components/Section'
import { Reveal } from '@/components/Reveal'
import { InstallTabs } from '@/components/InstallTabs'
import { CodeBlock } from '@/components/CodeBlock'
import { PropsTable } from '@/components/PropsTable'
import { ThemeDemo } from '@/components/ThemeDemo'
import { Footer } from '@/components/Footer'

const USAGE = `import { StampStack } from 'stampstack'
import 'stampstack/styles.css'

const items = [
  { id: 'a', title: 'First' },
  { id: 'b', title: 'Second' },
]

<StampStack
  items={items}
  onSelect={(item) => console.log('open', item.id)}
  renderStamp={(item, state) => (
    <div style={{ opacity: state.focused ? 1 : 0.8 }}>{item.title}</div>
  )}
/>`

const THEMING = `.stampstack {
  --stampstack-frame: #295df6;     /* frame color */
  --stampstack-card-bg: #fff;      /* inner paper */
  --stampstack-text: #2a2b32;      /* default text (flips in dark) */
  --stampstack-radius: 21px;
  --stampstack-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --stampstack-perspective: 1200px;
}`

export default function Home() {
  return (
    <main>
      <Hero />

      <Reveal>
        <Section label="Install">
          <InstallTabs />
        </Section>
      </Reveal>

      <Reveal>
        <Section label="Usage">
          <CodeBlock code={USAGE} lang="tsx" />
        </Section>
      </Reveal>

      <Reveal>
        <Section label="Props">
          <PropsTable />
        </Section>
      </Reveal>

      <Reveal>
        <Section label="Theming & dark mode">
          <CodeBlock code={THEMING} lang="css" />
          <div style={{ marginTop: 16 }}>
            <ThemeDemo />
          </div>
        </Section>
      </Reveal>

      <Reveal>
        <Footer />
      </Reveal>
    </main>
  )
}
