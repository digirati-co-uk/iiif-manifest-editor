import { describe, expect, test } from 'vitest'
import { doclingToHtmlDocument, doclingToHtmlFragment } from '../parser'

describe('docling parser', () => {
  test('renders headings, lists, code blocks, formulas, figures, and page breaks', () => {
    const html = doclingToHtmlFragment(
      '<doctag><title>Quarterly report</title><unordered_list><list_item>- one</list_item><list_item>- two</list_item></unordered_list><code><_typescript_>const value = 1;</code><formula>E=mc^2</formula><picture><caption>Preview</caption><diagram></picture><page_break></doctag>',
    )

    expect(html).toContain('<h1>Quarterly report</h1>')
    expect(html).toContain('<li>one</li>')
    expect(html).toContain('<li>two</li>')
    expect(html).toContain(
      '<pre><code class="language-ts">const value = 1;</code></pre>',
    )
    expect(html).toContain('<div class="formula">E=mc^2</div>')
    expect(html).toContain('<figcaption>Preview</figcaption>')
    expect(html).toContain('<hr class="page-break">')
  })

  test('renders otsl tables with header and row header semantics', () => {
    const html = doclingToHtmlFragment(
      '<doctag><otsl><ched>Head<fcel>Value<nl><rhed>Row<fcel>42</otsl></doctag>',
    )

    expect(html).toContain('<table><tbody>')
    expect(html).toContain('<th>Head</th>')
    expect(html).toContain('<th scope="row">Row</th>')
    expect(html).toContain('<td>42</td>')
  })

  test('wraps fragments in a full html document for iframe rendering', () => {
    const htmlDocument = doclingToHtmlDocument(
      '<doctag><paragraph>Hello world</paragraph></doctag>',
    )

    expect(htmlDocument).toContain('<!DOCTYPE html>')
    expect(htmlDocument).toContain('<body>')
    expect(htmlDocument).toContain('<p>Hello world</p>')
    expect(htmlDocument).toContain('katex')
  })
})
