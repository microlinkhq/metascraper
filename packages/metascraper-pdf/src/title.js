'use strict'

const { EMAIL, flatten, isBannerLine, isPersonName } = require('./text')

const TITLE_BLOCK_LIMIT = 6
const TITLE_SIZE_LEVELS = 3
const BYLINE_DISTANCE = 4
const MIN_TITLE_LENGTH = 3
const MAX_TITLE_LENGTH = 300

const CONTINUES_TITLE =
  /\b(for|of|and|the|in|on|to|with|from|a|an|at|by|via|using|towards?|de|del|la)$/i
const LINE_NUMBER = /(?<=\p{L}{3,})\d{1,2}(?=\s|$)/gu

const distinctSizes = lines =>
  [...new Set(lines.map(line => line.size))].sort((left, right) => right - left)

/**
 * A title keeps its font size while it wraps, and ends where the byline starts.
 */
const titleLines = (lines, titleLine) => {
  const block = [titleLine]

  for (let offset = 1; offset < TITLE_BLOCK_LIMIT; offset++) {
    const next = lines[titleLine.index + offset]
    const previous = block[block.length - 1]
    if (!next || next.size !== titleLine.size) break
    if (next.pageIndex != null && next.pageIndex !== previous.pageIndex + 1) {
      break
    }
    if (/[.?!]$/.test(previous.text) && !/:$/.test(previous.text)) break
    const continues = CONTINUES_TITLE.test(previous.text)
    if (EMAIL.test(next.text)) break
    if (!continues && (isPersonName(next.text) || isBannerLine(next.text))) {
      break
    }
    block.push(next)
  }

  return block
}

/** A line of names, rather than a title, has more names set beside it. */
const isByline = (line, lines) =>
  isPersonName(line.text) &&
  lines.some(
    other =>
      other.index !== line.index &&
      other.size === line.size &&
      Math.abs(other.index - line.index) <= BYLINE_DISTANCE &&
      isPersonName(other.text)
  )

/**
 * The title is the largest type on the page, skipping the banners publishers
 * print above it (`NBER WORKING PAPER SERIES`, `arXiv:2303.08774v6`, `REVIEW`)
 * and any byline set in the same size.
 */
const findTitleLine = lines => {
  for (const size of distinctSizes(lines).slice(0, TITLE_SIZE_LEVELS)) {
    const line = lines.find(
      candidate =>
        candidate.size === size &&
        !isBannerLine(candidate.text) &&
        !isByline(candidate, lines)
    )
    if (line) return line
  }
  return null
}

const isUsableTitle = text =>
  typeof text === 'string' &&
  text.length >= MIN_TITLE_LENGTH &&
  text.length <= MAX_TITLE_LENGTH

const getTitle = lines => {
  const line = findTitleLine(lines)
  if (!line) return null
  const block = titleLines(lines, line)
  const text = flatten(
    block.map(entry => entry.text.replace(LINE_NUMBER, '')).join(' ')
  )
  return isUsableTitle(text)
    ? { text, indexes: block.map(entry => entry.index) }
    : null
}

module.exports = { getTitle, isByline }
