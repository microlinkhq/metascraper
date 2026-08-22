'use strict'

const YEAR = '((?:19|20)\\d{2})'
const MONTHS =
  'january|february|march|april|may|june|july|august|september|october|november|december|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre'

const ARXIV_NEW =
  /arxiv\.org\/(?:abs|pdf)\/(\d{2})(\d{2})\.\d{4,5}|arxiv:(\d{2})(\d{2})\.\d{4,5}/i
const ARXIV_OLD =
  /arxiv\.org\/(?:abs|pdf)\/[a-z-]+(?:\.[A-Z]{2})?\/(\d{2})(\d{2})\d{3}|arxiv:[a-z-]+(?:\.[A-Z]{2})?\/(\d{2})(\d{2})\d{3}/i
const PATH_YEAR = /(?:^|[/_-])((?:19|20)\d{2})(?:[/_-]|$)/

const MARKED_YEAR = [
  new RegExp(
    `\\b(?:published|accepted|issued|publicado|publication date)\\b[^\\n]{0,40}?${YEAR}`,
    'i'
  ),
  new RegExp(`(?:©|\\(c\\)|copyright)[^\\n]{0,40}?${YEAR}`, 'i'),
  new RegExp(`\\barxiv:\\S+[^\\n]{0,30}?${YEAR}`, 'i'),
  new RegExp(`\\b(?:vol\\.?|volume|núm\\.?|no\\.)[^\\n]{0,40}?${YEAR}\\b`, 'i'),
  new RegExp(`\\b(?:${MONTHS})\\s+${YEAR}\\b`, 'i'),
  new RegExp(
    `\\b(?:cvpr|iccv|eccv|neurips|nips|icml|iclr|acl|emnlp|naacl|interspeech|aaai|ijcai)\\s*${YEAR}\\b`,
    'i'
  ),
  new RegExp(
    `${YEAR}\\s+(?:ieee|acm|international conference|conference on)`,
    'i'
  )
]

const HEADER_LINES = 12
const FOOTER_LINES = 4
const BODY_LINE_WORDS = 18
const ARXIV_EPOCH = 1991

const toFullYear = shortYear => {
  const year = Number(shortYear)
  return year >= 91 ? 1900 + year : 2000 + year
}

const arxivStamp = source => {
  const match = ARXIV_NEW.exec(source) || ARXIV_OLD.exec(source)
  if (!match) return null
  const [year, month] = match.slice(1).filter(Boolean)
  return { year: toFullYear(year), month: Number(month) }
}

/**
 * An arXiv id encodes the month it was announced, and proceedings hosts put the
 * year in the path. Both beat the PDF creation date, which is the day the file
 * was last built.
 */
const identifierDate = (url, { text = '' } = {}) => {
  const stamp = arxivStamp(url) || arxivStamp(text.slice(0, 400))
  if (
    stamp &&
    stamp.year >= ARXIV_EPOCH &&
    stamp.month >= 1 &&
    stamp.month <= 12
  ) {
    const month = String(stamp.month).padStart(2, '0')
    return `${stamp.year}-${month}-01T00:00:00.000Z`
  }

  const { pathname } = new URL(url)
  const match = PATH_YEAR.exec(pathname)
  const year = match ? Number(match[1]) : 0
  return year >= 1900 ? `${year}-01-01T00:00:00.000Z` : null
}

const headerAndFooter = lines => {
  const header = []

  for (const line of lines) {
    if (header.length >= HEADER_LINES) break
    header.push(line.text)
    if (line.text.split(/\s+/).length >= BODY_LINE_WORDS && header.length > 1) {
      break
    }
  }

  return [...header, ...lines.slice(-FOOTER_LINES).map(line => line.text)].join(
    '\n'
  )
}

const firstMarkedYear = (text, currentYear) => {
  for (const pattern of MARKED_YEAR) {
    const match = pattern.exec(text)
    const year = match ? Number(match[1]) : 0
    if (year >= 1900 && year <= currentYear) return year
  }
  return null
}

const documentYear = (lines, { embedded = {}, now = new Date() } = {}) => {
  const currentYear = now.getUTCFullYear()
  const venue = [embedded.description, embedded.keywords, embedded.title]
    .filter(Boolean)
    .join('\n')
  return (
    firstMarkedYear(headerAndFooter(lines), currentYear) ||
    firstMarkedYear(venue, currentYear)
  )
}

const getDate = (url, { lines, text, embedded, rawEmbedded, now }) => {
  const fromIdentifier = identifierDate(url, { text })
  if (fromIdentifier) return fromIdentifier

  const year = documentYear(lines, { embedded: rawEmbedded, now })
  if (year == null) return embedded.date
  if (embedded.date && new Date(embedded.date).getUTCFullYear() === year) {
    return embedded.date
  }
  return `${year}-01-01T00:00:00.000Z`
}

module.exports = { documentYear, getDate, identifierDate }
