import { doclingToHtmlDocument } from './parser'
import { buildDoclingAnnotationPages } from './layout'
import type { DoclingBatchResult, DoclingPageResult } from './types'

function unwrapDoclingRoot(docling: string): { rootTag: string; content: string } {
  const trimmed = docling.trim()
  const match = trimmed.match(/^<(doctag|document)>([\s\S]*)<\/\1>$/)

  if (!match) {
    return {
      rootTag: 'doctag',
      content: trimmed,
    }
  }

  return {
    rootTag: match[1],
    content: match[2].trim(),
  }
}

export function mergeDoclingPages(pageDocling: string[]): string {
  const nonEmptyPages = pageDocling.map((page) => page.trim()).filter(Boolean)
  if (nonEmptyPages.length === 0) {
    return '<doctag></doctag>'
  }

  const firstPage = unwrapDoclingRoot(nonEmptyPages[0])
  const mergedContent = nonEmptyPages
    .map((page) => unwrapDoclingRoot(page).content)
    .join('<page_break>')

  return `<${firstPage.rootTag}>${mergedContent}</${firstPage.rootTag}>`
}

export function buildDoclingBatchResult(
  pages: DoclingPageResult[],
  durationMs: number,
): DoclingBatchResult {
  const mergedDocling = mergeDoclingPages(pages.map((page) => page.docling))

  return {
    pages,
    annotationPages: buildDoclingAnnotationPages(pages),
    document: {
      docling: mergedDocling,
      html: doclingToHtmlDocument(mergedDocling),
      pageCount: pages.length,
      durationMs,
    },
  }
}
