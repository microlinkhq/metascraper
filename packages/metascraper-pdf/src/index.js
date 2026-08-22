'use strict'

const asyncMemoizeOne = require('async-memoize-one')
const memoize = require('@keyvhq/memoize')
const got = require('got')

const helpers = require('@metascraper/helpers')

const { getAuthor, nameCount } = require('./author')
const { getDescription } = require('./description')
const { getDate } = require('./date')
const { getPublisher } = require('./publisher')
const { getTitle } = require('./title')
const { getLang } = require('./lang')
const { getMedia } = require('./media')
const { headerLines } = require('./layout')
const { readDocument } = require('./document')
const { readEmbedded } = require('./embedded')
const { isInvertedName } = require('./text')

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]
const PDF_HEAD = 1024
const PDF_PATH = /(?:^|\/)pdf(?:\/|$)/i
const PDF_TYPE = /^(?:pdf|printable)$/i
const MAX_PAGES = 2

const toBytes = input =>
  input instanceof ArrayBuffer
    ? new Uint8Array(input)
    : ArrayBuffer.isView(input)
      ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
      : null

/** `%PDF` may sit anywhere in the first 1KB; the spec allows leading junk. */
const isPdf = input => {
  const bytes = toBytes(input)
  if (!bytes || bytes.length < PDF_MAGIC.length) return false
  const head = bytes.subarray(0, PDF_HEAD)
  for (let i = 0; i <= head.length - PDF_MAGIC.length; i++) {
    if (
      head[i] === PDF_MAGIC[0] &&
      head[i + 1] === PDF_MAGIC[1] &&
      head[i + 2] === PDF_MAGIC[2] &&
      head[i + 3] === PDF_MAGIC[3]
    ) {
      return true
    }
  }
  return false
}

const isPdfLink = url => {
  if (!url || !helpers.isUrl(url)) return false
  if (helpers.isPdfUrl(url)) return true
  try {
    const parsed = new URL(url)
    return (
      PDF_PATH.test(parsed.pathname) ||
      PDF_TYPE.test(parsed.searchParams.get('type') || '')
    )
  } catch (_) {
    return false
  }
}

/** "Surname, Given" is one person; "A, B" is two. */
const firstAuthor = value => {
  if (!value) return null
  const first = value.split(/\s*;\s*/)[0]
  if (isInvertedName(first)) {
    const [surname, given] = first.split(/,\s*/)
    return `${given} ${surname}`
  }
  return first.split(/,\s*/)[0]
}

/** A name lifted out of the title block is a title fragment, not an author. */
const withoutContext = (names, context) => {
  if (!names) return null
  const kept = names
    .split(', ')
    .filter(name => !context.some(entry => entry && appearsIn(name, entry)))
  return kept.length > 0 ? kept.join(', ') : null
}

const appearsIn = (value, text) => {
  const normalize = input =>
    String(input || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
  const needle = normalize(value)
  return needle.length > 0 && normalize(text).includes(needle)
}

const extract = async ({ url, pdf, maxPages }) => {
  const document = await readDocument(pdf, { maxPages })
  const embedded = readEmbedded(document)
  const rawEmbedded = {
    description: document.info.Subject,
    keywords: document.info.Keywords,
    title: document.info.Title
  }

  const lines = headerLines(document.firstPageLines)
  const layoutTitle = getTitle(lines)

  const title =
    embedded.title && appearsIn(embedded.title, document.text)
      ? embedded.title
      : (layoutTitle && layoutTitle.text) || embedded.title

  const layoutAuthor = withoutContext(
    getAuthor(lines, {
      titleIndexes: (layoutTitle && layoutTitle.indexes) || []
    }),
    [title]
  )
  const authors =
    nameCount(layoutAuthor) > nameCount(embedded.author)
      ? layoutAuthor
      : embedded.author || layoutAuthor

  const author = firstAuthor(authors)
  const publisher =
    embedded.publisher || getPublisher(lines, { url, title, author: authors })
  const description = embedded.description || getDescription(document.lines)
  const date = getDate(url, {
    lines: document.firstPageLines,
    text: document.text,
    embedded,
    rawEmbedded
  })
  const lang = getLang(document.text, { url, embedded })
  const { image, logo } = getMedia(document.images, { url })

  return {
    title,
    author,
    authors,
    description,
    publisher,
    date,
    lang,
    image,
    logo
  }
}

const defaultGetPdf = gotOpts => async url => {
  try {
    const { body } = await got(url, { responseType: 'buffer', ...gotOpts })
    return isPdf(body) ? body : null
  } catch (_) {
    return null
  }
}

const createLoad = ({ maxPages, gotOpts, keyvOpts, getPdf }) => {
  const fetchPdf = getPdf || defaultGetPdf(gotOpts)

  const parse = async url => {
    const pdf = toBytes(await fetchPdf(url))
    if (!isPdf(pdf)) return {}
    return extract({ url, pdf, maxPages })
  }

  return asyncMemoizeOne(
    memoize(parse, keyvOpts, {
      value: value => (value === undefined ? null : value)
    })
  )
}

const NORMALIZERS = {
  author: helpers.author,
  date: helpers.date,
  description: helpers.description,
  image: helpers.image,
  lang: helpers.lang,
  logo: helpers.logo,
  publisher: helpers.publisher,
  title: helpers.title
}

const fromPdf =
  (propName, load) =>
    async ({ url }) => {
      const metadata = await load(url)
      return NORMALIZERS[propName](metadata && metadata[propName], { url })
    }

module.exports = ({ maxPages = MAX_PAGES, gotOpts, keyvOpts, getPdf } = {}) => {
  const load = createLoad({ maxPages, gotOpts, keyvOpts, getPdf })

  return {
    pkgName: 'metascraper-pdf',
    test: ({ url }) => isPdfLink(url),
    author: [fromPdf('author', load)],
    date: [fromPdf('date', load)],
    description: [fromPdf('description', load)],
    image: [fromPdf('image', load)],
    lang: [fromPdf('lang', load)],
    logo: [fromPdf('logo', load)],
    publisher: [fromPdf('publisher', load)],
    title: [fromPdf('title', load)]
  }
}

module.exports.test = ({ url }) => isPdfLink(url)
