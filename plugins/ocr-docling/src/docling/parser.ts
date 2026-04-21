class DoclingConverter {
  private readonly simpleTagMap: Record<string, string> = {
    doctag: 'div',
    document: 'div',
    ordered_list: 'ol',
    unordered_list: 'ul',
    list_item: 'li',
    caption: 'figcaption',
    footnote: 'sup',
    formula: 'div',
    page_footer: 'footer',
    page_header: 'header',
    picture: 'figure',
    chart: 'figure',
    table: 'table',
    otsl: 'table',
    text: 'p',
    paragraph: 'p',
    title: 'h1',
    document_index: 'div',
    form: 'form',
    key_value_region: 'dl',
    reference: 'a',
    smiles: 'span',
  }

  private readonly selfClosingTagMap: Record<string, string> = {
    checkbox_selected: '<input type="checkbox" checked disabled>',
    checkbox_unselected: '<input type="checkbox" disabled>',
    page_break: '<hr class="page-break">',
  }

  private readonly tableTagConfig: Record<
    string,
    { htmlTag: 'td' | 'th'; scope?: 'row' }
  > = {
    '<ched>': { htmlTag: 'th' },
    '<rhed>': { htmlTag: 'th', scope: 'row' },
    '<srow>': { htmlTag: 'th', scope: 'row' },
    '<fcel>': { htmlTag: 'td' },
    '<ecel>': { htmlTag: 'td' },
    '<ucel>': { htmlTag: 'td' },
    '<lcel>': { htmlTag: 'td' },
    '<xcel>': { htmlTag: 'td' },
  }

  private readonly tableTagRegex = new RegExp(
    `(${Object.keys(this.tableTagConfig).join('|')})`,
  )

  private readonly combinedTagRegex = new RegExp(
    `(<([a-z_0-9]+)>(.*?)<\\/\\2>)|(<(${Object.keys(this.selfClosingTagMap).join('|')})>)`,
    's',
  )

  convert(docling: string): string {
    const html = this.cleanupMetadataTokens(` ${docling} `)
    return this.processTags(html).trim()
  }

  private escapeHtml(text: string): string {
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
  }

  private processTags(text: string): string {
    let remainingText = text
    let result = ''

    while (remainingText.length > 0) {
      const match = remainingText.match(this.combinedTagRegex)

      if (match && typeof match.index === 'number') {
        result += this.escapeHtml(remainingText.slice(0, match.index))

        const fullMatch = match[0]
        const pairedTagName = match[2]
        const pairedContent = match[3]
        const selfClosingTagName = match[5]

        if (pairedTagName !== undefined) {
          result += this.convertSingleTag(pairedTagName, pairedContent)
        } else if (selfClosingTagName !== undefined) {
          result += this.selfClosingTagMap[selfClosingTagName] ?? ''
        }

        remainingText = remainingText.slice(match.index + fullMatch.length)
      } else {
        result += this.escapeHtml(remainingText)
        break
      }
    }

    return result
  }

  private convertSingleTag(tagName: string, content: string): string {
    if (tagName === 'list_item') {
      content = content.trim().replace(/^[·-]\s*/g, '')
    }

    switch (tagName) {
      case 'code':
        return this.convertBlockCode(content)
      case 'otsl':
        return this.convertTable(content)
      case 'picture':
      case 'chart':
        return this.convertPictureOrChart(tagName, content)
      case 'inline':
        return this.convertInlineContent(content)
      case 'section_header_level_0':
      case 'section_header_level_1':
      case 'section_header_level_2':
      case 'section_header_level_3':
      case 'section_header_level_4':
      case 'section_header_level_5': {
        const level = Number.parseInt(tagName.at(-1) ?? '0', 10) + 1
        return `<h${level}>${this.processTags(content)}</h${level}>`
      }
      default: {
        const htmlTag = this.simpleTagMap[tagName]
        if (!htmlTag) {
          return this.escapeHtml(`<${tagName}>${content}</${tagName}>`)
        }

        const processedContent = this.processTags(content)
        return `${this.getStartTag(tagName, htmlTag)}${processedContent}</${htmlTag}>`
      }
    }
  }

  private getStartTag(doclingTag: string, htmlTag: string): string {
    switch (doclingTag) {
      case 'doctag':
      case 'document':
        return '<div class="docling-document">'
      case 'formula':
        return '<div class="formula">'
      case 'document_index':
        return '<div class="toc">'
      case 'key_value_region':
        return '<dl class="key-value-region">'
      case 'form':
        return '<form class="form-container">'
      case 'smiles':
        return '<span class="smiles">'
      case 'reference':
        return '<a href="#">'
      default:
        return `<${htmlTag}>`
    }
  }

  private convertInlineContent(content: string): string {
    const inlineTagRegex = /<(code|formula|text|smiles)>(.*?)<\/\1>/s
    let remainingText = content
    let result = ''

    while (remainingText.length > 0) {
      const match = remainingText.match(inlineTagRegex)
      if (match && typeof match.index === 'number') {
        result += this.escapeHtml(remainingText.slice(0, match.index))

        const [fullMatch, tagName, innerContent] = match
        switch (tagName) {
          case 'code': {
            const languageMatch = innerContent.match(/<_(.*?)_>/)
            if (languageMatch?.[1]) {
              const language = this.sanitizeLanguageName(languageMatch[1])
              const codeContent = innerContent.replace(/<_(.*?)_>/, '').trim()
              const langClass =
                language !== 'unknown' ? ` class="language-${language}"` : ''
              result += `<code${langClass}>${this.escapeHtml(codeContent)}</code>`
            } else {
              result += `<code>${this.escapeHtml(innerContent)}</code>`
            }
            break
          }
          case 'formula':
            result += `<span class="formula">${this.escapeHtml(innerContent)}</span>`
            break
          case 'smiles':
            result += `<span class="smiles">${this.escapeHtml(innerContent)}</span>`
            break
          case 'text':
            result += this.escapeHtml(innerContent)
            break
        }

        remainingText = remainingText.slice(match.index + fullMatch.length)
      } else {
        result += this.escapeHtml(remainingText)
        break
      }
    }

    return result
  }

  private convertBlockCode(content: string): string {
    const languageMatch = content.match(/<_(.*?)_>/)
    const language = languageMatch?.[1]
      ? this.sanitizeLanguageName(languageMatch[1])
      : 'unknown'
    const codeContent = languageMatch ? content.replace(/<_(.*?)_>/, '').trim() : content
    const langClass = language !== 'unknown' ? ` class="language-${language}"` : ''
    return `<pre><code${langClass}>${this.escapeHtml(codeContent)}</code></pre>`
  }

  private convertTable(content: string): string {
    const rows = content
      .trim()
      .split(/<nl>/)
      .filter((row) => row.length > 0)

    type Cell = {
      content: string
      tag: string
      colspan: number
      rowspan: number
    }

    const cellGrid: Cell[][] = []

    rows.forEach((rowString, rowIndex) => {
      const parts = rowString.split(this.tableTagRegex)
      const currentRow: Cell[] = []
      let gridColumnIndex = 0

      for (let index = 1; index < parts.length; index += 2) {
        const tag = parts[index]
        const cellContent = parts[index + 1] ?? ''

        switch (tag) {
          case '<lcel>':
          case '<xcel>':
            if (currentRow.length > 0) {
              currentRow[currentRow.length - 1].colspan += 1
            }
            break
          case '<ucel>':
            if (rowIndex > 0 && cellGrid[rowIndex - 1]?.[gridColumnIndex]) {
              cellGrid[rowIndex - 1][gridColumnIndex].rowspan += 1
            }
            gridColumnIndex += 1
            break
          default:
            if (this.tableTagConfig[tag]) {
              currentRow.push({
                content: cellContent,
                tag,
                colspan: 1,
                rowspan: 1,
              })
              gridColumnIndex += 1
            }
            break
        }
      }

      cellGrid.push(currentRow)
    })

    const htmlRows = cellGrid
      .map((row) => {
        const cellsHtml = row
          .map((cell) => {
            const config = this.tableTagConfig[cell.tag]
            if (!config) {
              return ''
            }

            const attributes: string[] = []
            if (cell.colspan > 1) {
              attributes.push(`colspan="${cell.colspan}"`)
            }
            if (cell.rowspan > 1) {
              attributes.push(`rowspan="${cell.rowspan}"`)
            }
            if (config.scope) {
              attributes.push(`scope="${config.scope}"`)
            }

            const attrString = attributes.length > 0 ? ` ${attributes.join(' ')}` : ''
            return `<${config.htmlTag}${attrString}>${this.processTags(cell.content)}</${config.htmlTag}>`
          })
          .join('')

        return `<tr>${cellsHtml}</tr>`
      })
      .join('')

    return `<table><tbody>${htmlRows}</tbody></table>`
  }

  private convertPictureOrChart(tag: string, content: string): string {
    if (/<(fcel|ched|rhed)>/.test(content)) {
      const cleanedContent = content.replace(/<[a-z_]+>/g, (match) => {
        if (
          match.startsWith('<fcel') ||
          match.startsWith('<ched') ||
          match.startsWith('<rhed') ||
          match.startsWith('<nl')
        ) {
          return match
        }

        return ''
      })

      return this.convertTable(cleanedContent)
    }

    let captionHtml = ''
    const captionMatch = content.match(/<caption>(.*?)<\/caption>/s)
    if (captionMatch?.[1]) {
      captionHtml = `<figcaption>${this.processTags(captionMatch[1])}</figcaption>`
    }

    const contentWithoutCaption = content.replace(/<caption>(.*?)<\/caption>/s, '')
    const classMatch = contentWithoutCaption.match(/<([a-z_]+)>/)
    const altText = classMatch?.[1] ? classMatch[1].replaceAll('_', ' ') : tag
    const figureTag = this.simpleTagMap[tag] ?? 'figure'

    return `<${figureTag}><img alt="${this.escapeHtml(altText)}" src="">${captionHtml}</${figureTag}>`
  }

  private sanitizeLanguageName(language: string): string {
    const aliasMap: Record<string, string> = {
      'c#': 'csharp',
      'c++': 'cpp',
      objectivec: 'objective-c',
      visualbasic: 'vb',
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      ruby: 'rb',
      dockerfile: 'docker',
    }

    const lowerLanguage = language.toLowerCase()
    return aliasMap[lowerLanguage] ?? lowerLanguage.replace(/[\s#+]/g, '-')
  }

  private cleanupMetadataTokens(docling: string): string {
    return docling.replace(/<loc_[0-9]+>/g, '')
  }
}

const documentCss = `html {
  background-color: #f1eee8;
  color: #1b2530;
  font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
  line-height: 1.6;
}
body {
  max-width: 860px;
  margin: 0 auto;
  padding: 2rem;
  background: #fffdfa;
  box-shadow: 0 30px 60px rgba(27, 37, 48, 0.12);
}
header, footer {
  text-align: center;
  margin-bottom: 1rem;
}
h1, h2, h3, h4, h5, h6 {
  color: #102033;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
h1 {
  font-size: 2em;
  border-bottom: 1px solid rgba(16, 32, 51, 0.14);
  padding-bottom: 0.3em;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}
th, td {
  border: 1px solid rgba(16, 32, 51, 0.12);
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f3efe6;
  font-weight: 600;
}
figure {
  margin: 1.5em 0;
  text-align: center;
}
figcaption {
  color: #4a5d72;
  font-style: italic;
  margin-top: 0.5em;
}
img {
  max-width: 100%;
  height: auto;
}
pre {
  background-color: #f5efe3;
  border-radius: 10px;
  padding: 1em;
  overflow: auto;
}
code {
  font-family: "IBM Plex Mono", "SFMono-Regular", monospace;
  background-color: #f5efe3;
  border-radius: 4px;
  padding: 0.2em 0.4em;
}
pre code {
  background-color: transparent;
  padding: 0;
}
.formula {
  text-align: center;
  padding: 0.5em;
  margin: 1em 0;
}
.formula:not(:has(.katex)) {
  color: transparent;
}
.page-break {
  page-break-after: always;
  border-top: 1px dashed rgba(16, 32, 51, 0.2);
  margin: 2em 0;
}
.key-value-region {
  background-color: #f7f2e8;
  padding: 1em;
  border-radius: 8px;
  margin: 1em 0;
}
.key-value-region dt {
  font-weight: 600;
}
.key-value-region dd {
  margin-left: 1em;
  margin-bottom: 0.5em;
}
.form-container {
  border: 1px solid rgba(16, 32, 51, 0.12);
  padding: 1em;
  border-radius: 8px;
  margin: 1em 0;
}`

export function doclingToHtmlFragment(docling: string): string {
  return new DoclingConverter().convert(docling)
}

export function doclingToHtmlDocument(docling: string): string {
  const body = doclingToHtmlFragment(docling)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.23/dist/katex.min.css" integrity="sha384-//SZkxyB7axjCAopkAL1E1rve+ZSPKapD89Lo/lLhcsXR+zOYl5z6zJZEFXil+q0" crossorigin="anonymous">
  <style>${documentCss}</style>
</head>
<body>
  ${body}
  <script type="module">
    import katex from 'https://cdn.jsdelivr.net/npm/katex@0.16.23/dist/katex.mjs';
    import renderMathInElement from 'https://cdn.jsdelivr.net/npm/katex@0.16.23/dist/contrib/auto-render.mjs';

    for (const element of document.querySelectorAll('.formula')) {
      katex.render(element.textContent, element, {
        throwOnError: false,
      });
    }

    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\\\[', right: '\\\\]', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\\\(', right: '\\\\)', display: false }
      ],
      throwOnError: false,
    });
  </script>
</body>
</html>`
}
