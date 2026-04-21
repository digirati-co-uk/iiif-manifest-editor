import { describe, expect, test } from 'vitest'
import { buildDoclingBatchResult, mergeDoclingPages } from '../merge'

describe('docling page merge', () => {
  test('combines page roots into one document with page breaks', () => {
    expect(
      mergeDoclingPages([
        '<doctag><title>One</title></doctag>',
        '<doctag><paragraph>Two</paragraph></doctag>',
      ]),
    ).toBe(
      '<doctag><title>One</title><page_break><paragraph>Two</paragraph></doctag>',
    )
  })

  test('builds a document-level result from page-level results', () => {
    const batch = buildDoclingBatchResult(
      [
        {
          id: 'page-1',
          rawDocling: '<doctag><title>One</title></doctag>',
          docling: '<doctag><title>One</title></doctag>',
          html: '<html>page 1</html>',
          canvasId: 'https://example.invalid/canvas/page-1',
          boxes: [],
          annotations: [],
          durationMs: 10,
        },
        {
          id: 'page-2',
          rawDocling: '<doctag><paragraph>Two</paragraph></doctag>',
          docling: '<doctag><paragraph>Two</paragraph></doctag>',
          html: '<html>page 2</html>',
          canvasId: 'https://example.invalid/canvas/page-2',
          boxes: [],
          annotations: [],
          durationMs: 12,
        },
      ],
      40,
    )

    expect(batch.annotationPages).toEqual([])
    expect(batch.document.pageCount).toBe(2)
    expect(batch.document.durationMs).toBe(40)
    expect(batch.document.docling).toContain('<page_break>')
    expect(batch.document.html).toContain('page-break')
  })
})
