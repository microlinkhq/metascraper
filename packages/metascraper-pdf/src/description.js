'use strict'

const ABSTRACT_HEADING =
  /(?:^|\n)\s*(?:abstract|summary|executive summary)\b[.:—-]?\s*/i
const RUNNING_HEADER = /[|·•‖]|^\d+\s|\bdoi:/i
const SENTENCE_END = /(?<=[.!?])\s+/
const MAX_SUMMARY_LENGTH = 300
const MIN_SUMMARY_LENGTH = 40

const dehyphenate = text => text.replace(/([a-z])-\s+([a-z])/g, '$1$2')

/** The size that carries most of the page is the body text, not the furniture. */
const dominantSize = lines => {
  const weight = new Map()
  for (const line of lines) {
    weight.set(line.size, (weight.get(line.size) || 0) + line.text.length)
  }
  return [...weight.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([size]) => size)[0]
}

const firstSentences = (text, maxLength) => {
  const sentences = text.split(SENTENCE_END)
  let summary = ''

  for (const sentence of sentences) {
    if (summary && `${summary} ${sentence}`.length > maxLength) break
    summary = summary ? `${summary} ${sentence}` : sentence
    if (summary.length >= maxLength) break
  }

  if (summary.length <= maxLength) return summary.trim()
  const clipped = summary.slice(0, maxLength)
  return `${clipped.slice(0, clipped.lastIndexOf(' ')).trim()}…`
}

/**
 * The abstract, or the first real paragraph when the document has none.
 */
const getDescription = (lines, { maxLength = MAX_SUMMARY_LENGTH } = {}) => {
  const readable = lines.filter(line => !RUNNING_HEADER.test(line.text))
  const text = dehyphenate(readable.map(line => line.text).join('\n'))
  const abstract = ABSTRACT_HEADING.exec(text)

  const bodySize = dominantSize(readable)
  const body = abstract
    ? text.slice(abstract.index + abstract[0].length)
    : readable
      .filter(line => line.size === bodySize)
      .map(line => line.text)
      .join(' ')

  const summary = firstSentences(
    dehyphenate(body).replace(/\s+/g, ' ').trim(),
    maxLength
  )
  return summary.length >= MIN_SUMMARY_LENGTH ? summary : null
}

module.exports = { getDescription }
