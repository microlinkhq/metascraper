'use strict'

const JUNK_TITLE = [
  /^untitled/i,
  /^arxiv:/i,
  /^document ?\d*$/i,
  /^microsoft word/i,
  /^microsoft powerpoint/i,
  /^print$/i,
  /^slide ?\d*$/i,
  /^layout ?\d*$/i,
  /^book ?\d*$/i,
  /\.(pdf|doc|docx|dot|ppt|pptx|xls|xlsx|tex|indd|qxd|pages|odt|rtf|md|htm|html|dvi)$/i,
  /^[\da-f-]{16,}$/i,
  /^[/\\~]/
]

const JUNK_AUTHOR = [
  /^(user|users|admin|administrator|owner|guest|unknown|anonymous|author|me|none|null|n\/?a)$/i,
  /^(windows|microsoft|office|word|acrobat|adobe|wps|libreoffice|openoffice|hp|dell|toshiba|acer|lenovo|asus|sony|compaq)[\s-]*(user|office user|inc\.?)?$/i,
  /\.(pdf|doc|docx|tex)$/i
]

const SERIES_PREFIX =
  /^[^:]{0,60}?\b(working paper|discussion paper|technical report|staff report)s?\s*\d*\s*:\s*/i
const CATALOG_PREFIX = /^(redalyc|scielo|dialnet)\.\s*/i
const VENUE_DESCRIPTION =
  /^((19|20)\d{2}\s+)?(neural information|ieee|acm|proceedings|conference|workshop|journal|volume|doi|https?:|www\.)|https?:\/\/|\bdoi:\s*10\.\d/i

const MIN_TITLE_LENGTH = 3
const MIN_DESCRIPTION_LENGTH = 40

const clean = value => {
  const text = Array.isArray(value) ? value.join(', ') : value
  if (typeof text !== 'string') return null
  const normalized = text.replace(/\s+/g, ' ').trim()
  return normalized.length > 0 ? normalized : null
}

const isJunk = (value, patterns) =>
  patterns.some(pattern => pattern.test(value))

const sameAsGenerator = (value, { creator, producer }) =>
  [creator, producer]
    .filter(Boolean)
    .some(generator => generator.toLowerCase() === value.toLowerCase())

const toDate = value => {
  const match = /^D:(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?/.exec(
    String(value || '')
  )
  if (!match) return null
  const [
    ,
    year,
    month = '01',
    day = '01',
    hour = '00',
    minute = '00',
    second = '00'
  ] = match
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/**
 * The Info dictionary and XMP packet, minus the noise every PDF writer leaves
 * behind: LaTeX ships an empty title, Word ships the filename, conference
 * templates ship the venue as the subject.
 */
const readEmbedded = ({ info = {}, xmp = {} } = {}) => {
  const creator = clean(info.Creator)
  const producer = clean(info.Producer)
  const generators = { creator, producer }

  const rawTitle = (clean(xmp['dc:title']) || clean(info.Title) || '')
    .replace(SERIES_PREFIX, '')
    .replace(CATALOG_PREFIX, '')
  const rawAuthor = clean(xmp['dc:creator']) || clean(info.Author)
  const rawDescription = clean(xmp['dc:description']) || clean(info.Subject)

  const title =
    rawTitle.length >= MIN_TITLE_LENGTH &&
    !isJunk(rawTitle, JUNK_TITLE) &&
    !sameAsGenerator(rawTitle, generators)
      ? rawTitle
      : null

  const author =
    rawAuthor &&
    !isJunk(rawAuthor, JUNK_AUTHOR) &&
    !sameAsGenerator(rawAuthor, generators)
      ? rawAuthor
      : null

  const description =
    rawDescription &&
    rawDescription.length >= MIN_DESCRIPTION_LENGTH &&
    !VENUE_DESCRIPTION.test(rawDescription)
      ? rawDescription
      : null

  return {
    title,
    author,
    description,
    publisher: clean(xmp['dc:publisher']),
    date: toDate(info.CreationDate) || clean(xmp['xmp:createdate']),
    lang: clean(xmp['dc:language']) || clean(info.Language) || clean(info.Lang),
    creator,
    producer,
    keywords: clean(info.Keywords)
  }
}

module.exports = { readEmbedded, toDate }
