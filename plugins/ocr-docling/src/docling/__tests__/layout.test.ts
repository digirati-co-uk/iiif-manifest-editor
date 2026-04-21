import { describe, expect, test } from 'vitest'
import {
  buildDoclingAnnotationPages,
  createDoclingAnnotations,
  extractDoclingLayoutBoxes,
  extractDoclingRegions,
  stripDoclingMetadata,
} from '../layout'

describe('docling layout helpers', () => {
  test('extracts parsed regions with categories, text, and boxes', () => {
    expect(
      extractDoclingRegions(
        '<doctag><title><loc_10><loc_20><loc_110><loc_60>Quarterly report</title><paragraph><loc_12><loc_70><loc_180><loc_120>Hello <text>world</text></paragraph></doctag>',
      ),
    ).toEqual([
      {
        category: 'title',
        text: 'Quarterly report',
        bbox: {
          left: 10,
          top: 20,
          right: 110,
          bottom: 60,
        },
      },
      {
        category: 'paragraph',
        text: 'Hello world',
        bbox: {
          left: 12,
          top: 70,
          right: 180,
          bottom: 120,
        },
      },
    ])
  })

  test('ignores wrapper tags and keeps structural regions with coordinates', () => {
    expect(
      extractDoclingRegions(
        '<doctag><picture><loc_1><loc_2><loc_3><loc_4><caption>Preview</caption></picture><table><loc_5><loc_6><loc_25><loc_26><ched>Head<fcel>Value</table></doctag>',
      ),
    ).toEqual([
      {
        category: 'picture',
        text: 'Preview',
        bbox: {
          left: 1,
          top: 2,
          right: 3,
          bottom: 4,
        },
      },
      {
        category: 'table',
        text: 'Head Value',
        bbox: {
          left: 5,
          top: 6,
          right: 25,
          bottom: 26,
        },
      },
    ])
  })

  test('derives layout boxes from parsed regions', () => {
    expect(
      extractDoclingLayoutBoxes(
        '<doctag><paragraph><loc_10><loc_20><loc_30><loc_40>One</paragraph><paragraph><loc_50><loc_60><loc_70><loc_80>Two</paragraph></doctag>',
      ),
    ).toEqual([
      {
        left: 10,
        top: 20,
        right: 30,
        bottom: 40,
      },
      {
        left: 50,
        top: 60,
        right: 70,
        bottom: 80,
      },
    ])
  })

  test('removes location and end tokens from the cleaned docling text', () => {
    expect(
      stripDoclingMetadata(
        '<doctag><paragraph><loc_12>Hello</paragraph></doctag><|end_of_text|>',
      ),
    ).toBe('<doctag><paragraph>Hello</paragraph></doctag>')
  })

  test('creates w3c annotations with media-fragment selectors', () => {
    const annotations = createDoclingAnnotations(
      [
        {
          category: 'paragraph',
          text: 'Hello world',
          bbox: {
            left: 12,
            top: 20,
            right: 62,
            bottom: 50,
          },
        },
        {
          category: 'picture',
          text: '',
          bbox: {
            left: 70,
            top: 10,
            right: 110,
            bottom: 60,
          },
        },
      ],
      'https://example.invalid/canvas/test',
    )

    expect(annotations).toHaveLength(2)
    expect(annotations[0]).toMatchObject({
      type: 'Annotation',
      motivation: 'supplementing',
      category: 'paragraph',
      target: {
        source: 'https://example.invalid/canvas/test',
        selector: {
          type: 'FragmentSelector',
          conformsTo: 'http://www.w3.org/TR/media-frags/',
          value: 'xywh=pixel,12,20,50,30',
        },
      },
      body: [
        {
          type: 'TextualBody',
          purpose: 'tagging',
          value: 'paragraph',
        },
        {
          type: 'TextualBody',
          format: 'text/plain',
          value: 'Hello world',
        },
      ],
    })
    expect(annotations[1].body).toEqual([
      {
        type: 'TextualBody',
        purpose: 'tagging',
        value: 'picture',
      },
    ])
  })

  test('groups annotations into annotation pages by category', () => {
    const annotationPages = buildDoclingAnnotationPages([
      {
        id: 'page-1',
        rawDocling: '<doctag><title>One</title></doctag>',
        docling: '<doctag><title>One</title></doctag>',
        html: '<html>page 1</html>',
        canvasId: 'https://example.invalid/canvas/page-1',
        boxes: [],
        annotations: [
          {
            id: 'annotation-1',
            type: 'Annotation',
            motivation: 'supplementing',
            category: 'title',
            body: [{ type: 'TextualBody', purpose: 'tagging', value: 'title' }],
            target: {
              source: 'https://example.invalid/canvas/page-1',
              selector: {
                type: 'FragmentSelector',
                conformsTo: 'http://www.w3.org/TR/media-frags/',
                value: 'xywh=pixel,1,2,3,4',
              },
            },
          },
        ],
        durationMs: 10,
      },
      {
        id: 'page-2',
        rawDocling: '<doctag><title>Two</title><paragraph>Hello</paragraph></doctag>',
        docling: '<doctag><title>Two</title><paragraph>Hello</paragraph></doctag>',
        html: '<html>page 2</html>',
        canvasId: 'https://example.invalid/canvas/page-2',
        boxes: [],
        annotations: [
          {
            id: 'annotation-2',
            type: 'Annotation',
            motivation: 'supplementing',
            category: 'title',
            body: [{ type: 'TextualBody', purpose: 'tagging', value: 'title' }],
            target: {
              source: 'https://example.invalid/canvas/page-2',
              selector: {
                type: 'FragmentSelector',
                conformsTo: 'http://www.w3.org/TR/media-frags/',
                value: 'xywh=pixel,5,6,7,8',
              },
            },
          },
          {
            id: 'annotation-3',
            type: 'Annotation',
            motivation: 'supplementing',
            category: 'paragraph',
            body: [{ type: 'TextualBody', purpose: 'tagging', value: 'paragraph' }],
            target: {
              source: 'https://example.invalid/canvas/page-2',
              selector: {
                type: 'FragmentSelector',
                conformsTo: 'http://www.w3.org/TR/media-frags/',
                value: 'xywh=pixel,9,10,11,12',
              },
            },
          },
        ],
        durationMs: 12,
      },
    ])

    expect(annotationPages).toHaveLength(2)
    expect(annotationPages[0].category).toBe('title')
    expect(annotationPages[0].items.map((item) => item.id)).toEqual([
      'annotation-1',
      'annotation-2',
    ])
    expect(annotationPages[1].category).toBe('paragraph')
    expect(annotationPages[1].items.map((item) => item.id)).toEqual([
      'annotation-3',
    ])
  })
})
