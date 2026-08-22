'use strict'

const MAX_HEADER_LINES = 20
const MAX_FOOTER_LINES = 8
const MAX_FOOTER_WORDS = 30
const MAX_PROMINENT_LINES = 8
const PROMINENT_SIZE_LEVELS = 2
const FOLLOWING_LINES = 2
const FOOTER_BAND = 0.12
const BODY_LINE_WORDS = 18

const wordCount = text => text.split(/\s+/).length

const leadingBlock = lines => {
  const header = []

  for (const line of lines) {
    if (header.length >= MAX_HEADER_LINES) break
    header.push(line)
    if (wordCount(line.text) >= BODY_LINE_WORDS && header.length > 1) break
  }

  return header
}

const prominentLines = lines => {
  const sizes = [...new Set(lines.map(line => line.size))]
    .sort((left, right) => right - left)
    .slice(0, PROMINENT_SIZE_LEVELS)

  return lines
    .filter(line => sizes.includes(line.size))
    .slice(0, MAX_PROMINENT_LINES)
    .flatMap(line =>
      lines.slice(line.pageIndex, line.pageIndex + 1 + FOLLOWING_LINES)
    )
}

/**
 * The lines worth reading on the first page: the block above the first
 * paragraph, the largest type anywhere on the page (magazine layouts put the
 * title well below the fold of the text stream), and the running footer.
 */
const headerLines = lines => {
  const numbered = lines.map((line, pageIndex) => ({ ...line, pageIndex }))
  const leading = leadingBlock(numbered)
  const pageHeight = numbered.length > 0 ? numbered[0].pageHeight : null

  const isFooter = line =>
    pageHeight
      ? line.y <= pageHeight * FOOTER_BAND
      : line.pageIndex >= numbered.length - MAX_FOOTER_LINES

  const footer = numbered
    .filter(line => isFooter(line) && wordCount(line.text) < MAX_FOOTER_WORDS)
    .slice(-MAX_FOOTER_LINES)

  const chosen = new Map()
  for (const line of [...leading, ...prominentLines(numbered), ...footer]) {
    chosen.set(line.pageIndex, line)
  }

  return [...chosen.values()]
    .sort((left, right) => left.pageIndex - right.pageIndex)
    .map((line, index) => ({ ...line, index }))
}

module.exports = { headerLines }
