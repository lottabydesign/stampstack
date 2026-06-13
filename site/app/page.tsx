import { Hero } from '@/components/Hero'
import { Section } from '@/components/Section'
import { Reveal } from '@/components/Reveal'
import { InstallTabs } from '@/components/InstallTabs'
import { ActionButtons } from '@/components/ActionButtons'
import { CodeBlock } from '@/components/CodeBlock'
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

export default function Home() {
  return (
    <main>
      <Hero />

      <Reveal>
        <Section label="Install" marginTop={32}>
          <InstallTabs />
          <ActionButtons />
        </Section>
      </Reveal>

      <Reveal>
        <Section label="Usage">
          <CodeBlock code={USAGE} lang="tsx" />
        </Section>
      </Reveal>

      <Reveal>
        <Footer />
      </Reveal>
    </main>
  )
}
