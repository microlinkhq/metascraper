'use strict'

const EMAIL = /\S+@\S+/
const EMAIL_GLOBAL = /\S+@\S+/g
const FOOTNOTE_MARKS = /[*∗†‡§¶#]/g
const SUPERSCRIPTS = /(?<=\p{L})\d+(?:,\d+)*(?=\W|$)/gu
const COUNTRY_ABBREVIATION = /(^|\s)\p{Lu}\.\p{Lu}\.?($|\s|,)/u
const PLACE_NAME =
  /^(costa rica|united states|united kingdom|new zealand|south africa|puerto rico|el salvador|saudi arabia|south korea|hong kong)$/i
const INVERTED_NAME =
  /^\p{Lu}[\p{L}'’-]+(?:\s\p{Lu}[\p{L}'’-]+)*,\s\p{Lu}[\p{L}'’-]+(?:\s\p{Lu}[\p{L}'’.-]*)*$/u
const NAME_RUN_BOUNDARY = /(?<=\p{Ll})\s(?=\p{Lu}[\p{Ll}])/u

const ORGANIZATION_WORDS =
  /\b(universi\w*|institut\w*|department\w*|departamento|dept|laborator\w*|labs?|college|school|escuela|academy|academia|research|brain|cent(er|re|ro)|foundation|fundaci\w*|hospital|ministry|ministerio|agency|agencia|association|society|press|journal|proceedings|conference|inc|llc|ltd|gmbh|corp|corporation|company|co|google|microsoft|facebook|meta|openai|deepmind|nvidia|amazon|apple|ibm|baidu|alibaba|tencent|huawei|samsung|intel|adobe|anthropic)\b/i

/** Lower case only: a middle initial is `A`, a function word is `and`. */
const FUNCTION_WORDS =
  /\b(for|and|the|with|in|on|to|at|of|from|via|using|towards?|a|an|is|are|be|by)\b/

const NAME_PARTICLES = new Set([
  'van',
  'von',
  'de',
  'del',
  'della',
  'di',
  'da',
  'dos',
  'der',
  'den',
  'la',
  'le',
  'bin',
  'ibn'
])

const BANNER_LINE =
  /^((nber|bis|ecb|imf|oecd)\s+)?(working|discussion|conference|staff)\s+papers?(\s+series)?\s*\d*\b|^technical report$|^(review|research|original research|short|regular)\s+(article|paper)s?$|^preprints?$|^no\.?\s*\d+$|^volume\s+\d+|^published as a conference paper|^arxiv:\S+|^submitted to |^(reviews?|articles?|letters?|analysis|perspectives?|comments?|editorials?|news|features?|insights?|reports?|columns?|correspondence)$/i

const MAX_NAME_WORDS = 6
const MAX_INVERTED_WORDS = 3
const MIN_GIVEN_LETTERS = 3
const MIN_RUN_WORDS = 4
const MAX_RUN_WORDS = 14

const tidy = value =>
  value
    .replace(/[^\S ]+/g, ' ')
    .replace(/ {3,}/g, '  ')
    .trim()
    .replace(/^[,;:.\-–—&]+\s*|[,;:.\-–—&]+$/g, '')

const flatten = value => value.replace(/\s+/g, ' ').trim()

const stripNoise = text =>
  tidy(
    text
      .replace(EMAIL_GLOBAL, ' ')
      .replace(FOOTNOTE_MARKS, ' ')
      .replace(SUPERSCRIPTS, '')
  )

const isShouting = text => text === text.toUpperCase() && /\p{Lu}/u.test(text)

const isCapitalized = word =>
  /^[\p{Lu}]/u.test(word) || NAME_PARTICLES.has(word.toLowerCase())

const isInvertedName = text => {
  if (
    !INVERTED_NAME.test(text) ||
    text.split(/\s+/).length > MAX_INVERTED_WORDS
  ) {
    return false
  }
  const given = text.split(',')[1] || ''
  return (given.match(/\p{L}/gu) || []).length >= MIN_GIVEN_LETTERS
}

const isPersonName = rawText => {
  const text = stripNoise(rawText)
  if (isInvertedName(text)) return !ORGANIZATION_WORDS.test(text)
  if (EMAIL.test(text) || /\d/.test(text) || /^https?:/i.test(text)) {
    return false
  }
  if (
    isShouting(text) ||
    COUNTRY_ABBREVIATION.test(text) ||
    PLACE_NAME.test(text)
  ) {
    return false
  }
  if (ORGANIZATION_WORDS.test(text) || FUNCTION_WORDS.test(text)) return false
  const words = text.split(/\s+/)
  return (
    words.length >= 2 &&
    words.length <= MAX_NAME_WORDS &&
    words.every(isCapitalized)
  )
}

const isBannerLine = text => BANNER_LINE.test(tidy(text))

const splitNamePairs = text => {
  const words = text.split(/\s+/).filter(Boolean)
  if (
    words.length < MIN_RUN_WORDS ||
    words.length > MAX_RUN_WORDS ||
    words.length % 2 !== 0
  ) {
    return []
  }
  if (!words.every(word => /^\p{Lu}/u.test(word))) return []
  return words.flatMap((word, index) =>
    index % 2 === 0 ? [`${word} ${words[index + 1]}`] : []
  )
}

const splitNameRun = part => {
  if (part.split(/\s+/).length < MIN_RUN_WORDS) return [part]
  const pieces = part.split(NAME_RUN_BOUNDARY)
  return pieces.every(
    piece => /^\p{Lu}/u.test(piece) && piece.split(/\s+/).length <= 3
  )
    ? pieces
    : [part]
}

const splitNames = text =>
  isInvertedName(text)
    ? [text]
    : text.split(/\s{2,}|\s*(?:,|;| and | & )\s*/).flatMap(splitNameRun)

module.exports = {
  EMAIL,
  ORGANIZATION_WORDS,
  PLACE_NAME,
  flatten,
  isBannerLine,
  isInvertedName,
  isPersonName,
  isShouting,
  splitNamePairs,
  splitNames,
  stripNoise,
  tidy
}
