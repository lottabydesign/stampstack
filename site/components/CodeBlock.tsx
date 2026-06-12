import { codeToHtml } from 'shiki'
import { CopyButton } from './CopyButton'

export async function CodeBlock({ code, lang = 'tsx' }: { code: string; lang?: string }) {
  const html = await codeToHtml(code, { lang, theme: 'github-light' })
  return (
    <div className="code-card lift">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <CopyButton text={code} />
    </div>
  )
}
