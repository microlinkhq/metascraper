'use strict'

const {
  ORGANIZATION_WORDS,
  PLACE_NAME,
  flatten,
  isBannerLine,
  isPersonName,
  splitNamePairs,
  splitNames,
  stripNoise,
  tidy
} = require('./text')

const EDITOR_PREFIX =
  /^(edited|reviewed|approved|submitted|received|accepted|published)\s+by\s*:?|^(editors?|reviewing editors?|action editors?)\s*:/i
const SECTION_WORDS =
  /^(abstract|summary|introduction|contents|table of contents|keywords|index|preface|foreword|version|draft)\b/i

const AUTHOR_BLOCK_MARGIN = 4
const EDITOR_BLOCK_LINES = 4
const MAX_ORGANIZATION_WORDS = 4
const MAX_AUTHORS = 10
const NEIGHBOUR_OFFSETS = [1, 2, 3, 4]

const isCapitalizedWord = word => /^[\p{Lu}]/u.test(word)

const isOrganizationAuthor = text => {
  if (/\S+@\S+/.test(text) || /\d/.test(text) || /^https?:/i.test(text)) {
    return false
  }
  if (SECTION_WORDS.test(text) || PLACE_NAME.test(text)) return false
  const words = text.split(/\s+/)
  return (
    words.length <= MAX_ORGANIZATION_WORDS && words.every(isCapitalizedWord)
  )
}

const editorBlock = lines => {
  const excluded = new Set()

  for (const line of lines) {
    if (!EDITOR_PREFIX.test(line.text)) continue
    for (let offset = 0; offset <= EDITOR_BLOCK_LINES; offset++) {
      excluded.add(line.index + offset)
    }
  }

  return excluded
}

const toAuthor = (lines, indexes, options = {}) => {
  const { organizationLimit = Infinity, allowOrganization = false } = options
  const excluded = editorBlock(lines)
  const usable = index => !excluded.has(index)

  const names = indexes
    .filter(usable)
    .map(index => lines[index])
    .filter(Boolean)
    .map(line => line.text)
    .filter(
      text =>
        !EDITOR_PREFIX.test(text) &&
        !ORGANIZATION_WORDS.test(text) &&
        !isBannerLine(text)
    )
    .flatMap(text => stripNoise(text).split(/;\s*/).flatMap(splitNames))
    .map(tidy)
    .filter(isPersonName)

  const unique = [...new Set(names.map(flatten))].slice(0, MAX_AUTHORS)
  if (unique.length > 1) return unique.join(', ')

  const paired = indexes
    .filter(usable)
    .map(index => lines[index])
    .filter(line => line && !ORGANIZATION_WORDS.test(line.text))
    .flatMap(line => splitNamePairs(stripNoise(line.text)))
    .filter(isPersonName)
  if (paired.length > unique.length) {
    return [...new Set(paired)].slice(0, MAX_AUTHORS).join(', ')
  }
  if (unique.length > 0) return unique.join(', ')

  if (!allowOrganization) return null

  const organization = indexes
    .filter(index => index <= organizationLimit && usable(index))
    .map(index => lines[index])
    .filter(Boolean)
    .map(line => flatten(stripNoise(line.text)))
    .find(isOrganizationAuthor)

  return organization || null
}

/**
 * Bylines share a font size. Once one name is found, every line set in the same
 * size around it belongs to the same block, which is what recovers the authors
 * hidden between affiliation and email lines.
 */
const expandAuthorLines = (lines, indexes, { titleIndexes = [] } = {}) => {
  const excludedTitle = new Set(titleIndexes)
  const usable = indexes.filter(index => !excludedTitle.has(index))
  const named = usable
    .map(index => lines[index])
    .filter(line => line && isPersonName(stripNoise(line.text)))

  if (named.length === 0) return usable

  const sizes = new Set(named.map(line => line.size))
  const first = Math.min(...named.map(line => line.index)) - AUTHOR_BLOCK_MARGIN
  const last = Math.max(...named.map(line => line.index)) + AUTHOR_BLOCK_MARGIN

  return lines
    .filter(
      line =>
        line.index >= first &&
        line.index <= last &&
        !excludedTitle.has(line.index)
    )
    .filter(line => sizes.has(line.size) && isPersonName(stripNoise(line.text)))
    .map(line => line.index)
}

const nameCount = value =>
  value ? value.split(/[,;]| and /).filter(Boolean).length : 0

const getAuthor = (lines, { titleIndexes = [] } = {}) => {
  const titleIndex =
    titleIndexes.length > 0 ? titleIndexes[titleIndexes.length - 1] : 0
  const neighbours = NEIGHBOUR_OFFSETS.map(offset => titleIndex + offset)
  const organization = {
    allowOrganization: true,
    organizationLimit: titleIndex + AUTHOR_BLOCK_MARGIN
  }

  return (
    toAuthor(lines, expandAuthorLines(lines, neighbours, { titleIndexes })) ||
    toAuthor(lines, neighbours, organization)
  )
}

module.exports = { expandAuthorLines, getAuthor, nameCount, toAuthor }
