import type {
  DoclingAnnotation,
  DoclingAnnotationPage,
  DoclingLayoutBox,
  DoclingPageResult,
  DoclingParsedRegion,
} from './types'

const END_OF_TEXT_TOKEN = /<\|end_of_text\|>/g
const LOCATION_TOKEN_REGEX = /<loc_(\d+)>/g
const TOKEN_REGEX = /<\|end_of_text\|>|<loc_\d+>|<\/?[a-z_0-9]+>|<_[^>]+_>|[^<]+/g
const WRAPPER_CATEGORIES = new Set(['doctag', 'document', 'inline'])
const SPACING_TAGS = new Set([
  'ched',
  'ecel',
  'fcel',
  'lcel',
  'nl',
  'page_break',
  'rhed',
  'srow',
  'ucel',
  'xcel',
])

type RegionContext = {
  category: string
  rawContent: string
  locationValues: number[]
}

export function stripDoclingMetadata(rawDocling: string): string {
  return rawDocling.replace(END_OF_TEXT_TOKEN, '').replace(LOCATION_TOKEN_REGEX, '').trim()
}

function createRandomId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function appendToOpenRegions(stack: RegionContext[], token: string): void {
  for (const region of stack) {
    region.rawContent += token
  }
}

function toLayoutBox(values: number[]): DoclingLayoutBox | null {
  if (values.length < 4) {
    return null
  }

  return {
    left: values[0],
    top: values[1],
    right: values[2],
    bottom: values[3],
  }
}

function extractRegionText(rawContent: string): string {
  return stripDoclingMetadata(rawContent)
    .replace(/<_[^>]+_>/g, ' ')
    .replace(/<\/?[a-z_0-9]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function finalizeRegion(stack: RegionContext[], regions: DoclingParsedRegion[]): void {
  const region = stack.pop()
  if (!region) {
    return
  }

  const bbox = toLayoutBox(region.locationValues)
  if (!bbox || WRAPPER_CATEGORIES.has(region.category)) {
    return
  }

  regions.push({
    category: region.category,
    text: extractRegionText(region.rawContent),
    bbox,
  })
}

export function extractDoclingRegions(rawDocling: string): DoclingParsedRegion[] {
  const stack: RegionContext[] = []
  const regions: DoclingParsedRegion[] = []
  let match: RegExpExecArray | null

  TOKEN_REGEX.lastIndex = 0

  while ((match = TOKEN_REGEX.exec(rawDocling)) !== null) {
    const token = match[0]

    if (token === '<|end_of_text|>') {
      continue
    }

    const locationMatch = token.match(/^<loc_(\d+)>$/)
    if (locationMatch) {
      appendToOpenRegions(stack, token)

      const current = stack.at(-1)
      if (current && current.locationValues.length < 4) {
        current.locationValues.push(Number.parseInt(locationMatch[1], 10))
      }
      continue
    }

    const closingMatch = token.match(/^<\/([a-z_0-9]+)>$/)
    if (closingMatch) {
      if (stack.at(-1)?.category === closingMatch[1]) {
        appendToOpenRegions(stack.slice(0, -1), token)
        finalizeRegion(stack, regions)
      } else {
        appendToOpenRegions(stack, token)
      }
      continue
    }

    const openingMatch = token.match(/^<([a-z_0-9]+)>$/)
    if (openingMatch) {
      const category = openingMatch[1]
      const hasClosingTag = rawDocling.includes(
        `</${category}>`,
        TOKEN_REGEX.lastIndex,
      )

      appendToOpenRegions(stack, token)

      if (hasClosingTag) {
        stack.push({
          category,
          rawContent: '',
          locationValues: [],
        })
      } else if (SPACING_TAGS.has(category)) {
        appendToOpenRegions(stack, ' ')
      }
      continue
    }

    appendToOpenRegions(stack, token)
  }

  while (stack.length > 0) {
    finalizeRegion(stack, regions)
  }

  return regions
}

export function extractDoclingLayoutBoxes(rawDocling: string): DoclingLayoutBox[] {
  return extractDoclingRegions(rawDocling).map((region) => region.bbox)
}

export function createDoclingCanvasId(): string {
  return `https://example.invalid/canvas/${createRandomId('stub')}`
}

export function createDoclingAnnotations(
  regions: DoclingParsedRegion[],
  canvasId: string,
): DoclingAnnotation[] {
  return regions.map((region, index) => {
    const width = Math.max(region.bbox.right - region.bbox.left, 0)
    const height = Math.max(region.bbox.bottom - region.bbox.top, 0)

    return {
      id: `https://example.invalid/annotation/${createRandomId(`region-${index + 1}`)}`,
      type: 'Annotation',
      motivation: 'supplementing',
      category: region.category,
      body: [
        {
          type: 'TextualBody',
          purpose: 'tagging',
          value: region.category,
        },
        ...(region.text
          ? [
              {
                type: 'TextualBody' as const,
                format: 'text/plain' as const,
                value: region.text,
              },
            ]
          : []),
      ],
      target: {
        source: canvasId,
        selector: {
          type: 'FragmentSelector',
          conformsTo: 'http://www.w3.org/TR/media-frags/',
          value: `xywh=pixel,${region.bbox.left},${region.bbox.top},${width},${height}`,
        },
      },
    }
  })
}

export function buildDoclingAnnotationPages(
  pages: DoclingPageResult[],
): DoclingAnnotationPage[] {
  const grouped = new Map<string, DoclingAnnotation[]>()

  for (const page of pages) {
    for (const annotation of page.annotations) {
      const items = grouped.get(annotation.category)
      if (items) {
        items.push(annotation)
      } else {
        grouped.set(annotation.category, [annotation])
      }
    }
  }

  return Array.from(grouped.entries(), ([category, items]) => ({
    id: `https://example.invalid/annotation-page/${createRandomId(category)}`,
    type: 'AnnotationPage',
    category,
    items,
  }))
}
