'use strict'

const { extractImages, getDocumentProxy } = require('unpdf')

const SAME_LINE_TOLERANCE = 2
const MIN_LINE_LENGTH = 2
const WORD_GAP_RATIO = 0.08
const COLUMN_GAP_RATIO = 1.5
const DEFAULT_MAX_PAGES = 2

const normalizeSpaces = text =>
  text
    .replace(/[^\S ]+/g, ' ')
    .replace(/ {3,}/g, '  ')
    .trim()

const toLines = items => {
  const lines = []

  for (const item of items) {
    if (!item.str.trim()) continue
    const x = item.transform[4]
    const y = item.transform[5]
    const size = item.height || item.transform[0]
    const previous = lines[lines.length - 1]

    if (previous && Math.abs(previous.y - y) <= SAME_LINE_TOLERANCE) {
      const gap = x - previous.endX
      const separator = gap > size * COLUMN_GAP_RATIO ? '  ' : ' '
      const needsSpace =
        gap > size * WORD_GAP_RATIO &&
        !/\s$/.test(previous.text) &&
        !/^\s/.test(item.str)
      previous.text += needsSpace ? `${separator}${item.str}` : item.str
      previous.size = Math.max(previous.size, size)
      previous.endX = x + item.width
    } else {
      lines.push({ y, size, text: item.str, endX: x + item.width })
    }
  }

  return lines
    .map(({ y, size, text }) => ({
      y,
      size: Number(size.toFixed(2)),
      text: normalizeSpaces(text)
    }))
    .filter(line => line.text.length >= MIN_LINE_LENGTH)
}

const pageLines = async (pdf, pageNumber) => {
  const page = await pdf.getPage(pageNumber)
  const { items } = await page.getTextContent()
  const height = page.view[3]
  return toLines(items).map(line => ({ ...line, pageHeight: height }))
}

const readDocument = async (buffer, { maxPages = DEFAULT_MAX_PAGES } = {}) => {
  const pdf = await getDocumentProxy(Uint8Array.from(buffer), {
    isEvalSupported: false,
    verbosity: 0
  })

  try {
    const { info, metadata } = await pdf.getMetadata()
    const pages = []

    for (
      let pageNumber = 1;
      pageNumber <= Math.min(maxPages, pdf.numPages);
      pageNumber++
    ) {
      pages.push(await pageLines(pdf, pageNumber))
    }

    const lines = pages.flat()
    let images = []
    try {
      images = await extractImages(pdf, 1)
    } catch (_) {}

    return {
      info: info || {},
      xmp: metadata?.getAll?.() || {},
      pageCount: pdf.numPages,
      firstPageLines: pages[0] || [],
      lines,
      images,
      text: lines.map(line => line.text).join('\n')
    }
  } finally {
    try {
      await pdf.loadingTask.destroy()
    } catch (_) {}
  }
}

module.exports = { readDocument, toLines }
