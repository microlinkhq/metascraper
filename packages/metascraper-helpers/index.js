'use strict'

const {
  chain,
  eq,
  flow,
  get,
  includes,
  invoke,
  isArray,
  isEmpty,
  isNumber,
  isBoolean,
  isString,
  isDate,
  lte,
  replace,
  size,
  toLower,
  toString
} = require('lodash')

const memoizeOne = require('memoize-one').default || require('memoize-one')
const urlRegex = require('url-regex-safe')({ exact: true, parens: true })
const condenseWhitespace = require('condense-whitespace')
const capitalize = require('microsoft-capitalize')
const { JSDOM, VirtualConsole } = require('jsdom')
const isRelativeUrl = require('is-relative-url')
const fileExtension = require('file-extension')
const _normalizeUrl = require('normalize-url')
const smartquotes = require('smartquotes')
const { decodeHTML } = require('entities')
const iso6393 = require('iso-639-3/to-1')
const mimeTypes = require('mime-types')
const hasValues = require('has-values')
const chrono = require('chrono-node')
const truncate = require('truncate')
const isIso = require('isostring')
const isUri = require('is-uri')
const { URL } = require('url')

const iso6393Values = Object.values(iso6393)

const toTitle = str =>
  capitalize(str, [
    'CLI',
    'API',
    'HTTP',
    'HTTPS',
    'JSX',
    'DNS',
    'URL',
    'CI',
    'CDN',
    'package.json',
    'GitHub',
    'GitLab',
    'CSS',
    'JS',
    'JavaScript',
    'TypeScript',
    'HTML',
    'WordPress',
    'JavaScript',
    'Node.js'
  ])

const VIDEO = 'video'
const AUDIO = 'audio'
const IMAGE = 'image'

const imageExtensions = chain(require('image-extensions'))
  .reduce((acc, ext) => ({ ...acc, [ext]: IMAGE }), {})
  .value()

const audioExtensions = chain(require('audio-extensions'))
  .concat(['mpga'])
  .difference(['mp4'])
  .reduce((acc, ext) => ({ ...acc, [ext]: AUDIO }), {})
  .value()

const videoExtensions = chain(require('video-extensions'))
  .reduce((acc, ext) => ({ ...acc, [ext]: VIDEO }), {})
  .value()

const EXTENSIONS = {
  ...imageExtensions,
  ...audioExtensions,
  ...videoExtensions
}

const REGEX_BY = /^[\s\n]*by[\s\n]+|@[\s\n]*/i

const REGEX_LOCATION = /^[A-Z\s]+\s+[-—–]\s+/

const REGEX_TITLE_SEPARATOR = /^[^|\-/•—]+/

const TRUNCATE_MAX_LENGTH = 300

const AUTHOR_MAX_LENGTH = 128

const removeLocation = value => replace(value, REGEX_LOCATION, '')

const isUrl = (url, { relative = false } = {}) =>
  relative ? isRelativeUrl(url) : urlRegex.test(url)

const urlObject = (...args) => {
  try {
    return new URL(...args)
  } catch (_) {
    return { toString: () => '' }
  }
}

const absoluteUrl = (baseUrl, relativePath) => {
  if (isEmpty(relativePath)) return urlObject(baseUrl).toString()
  return urlObject(relativePath, baseUrl).toString()
}

const sanetizeUrl = (url, opts) =>
  _normalizeUrl(url, {
    stripWWW: false,
    sortQueryParameters: false,
    removeTrailingSlash: false,
    ...opts
  })

const normalizeUrl = (baseUrl, relativePath, opts) => {
  try {
    return sanetizeUrl(absoluteUrl(baseUrl, relativePath), opts)
  } catch (_) {}
}

const removeBy = flow([
  value => value.replace(REGEX_BY, ''),
  condenseWhitespace
])

const removeSeparator = title =>
  condenseWhitespace((REGEX_TITLE_SEPARATOR.exec(title) || [])[0] || title)

const createTitle = flow([condenseWhitespace, smartquotes])

const titleize = (src, opts = {}) => {
  let title = createTitle(src)
  if (opts.removeBy) title = removeBy(title)
  if (opts.removeSeparator) title = removeSeparator(title)
  if (opts.capitalize) title = toTitle(title)
  return title
}

const $filter = ($, domNodes, fn = $filter.fn) => {
  const el = domNodes.filter((i, el) => fn($(el))).first()
  return fn(el)
}

$filter.fn = el => condenseWhitespace(el.text())

const isAuthor = (str, opts = { relative: false }) =>
  !isUrl(str, opts) &&
  !isEmpty(str) &&
  isString(str) &&
  lte(size(str), AUTHOR_MAX_LENGTH)

const getAuthor = (str, { removeBy = true, ...opts } = {}) =>
  titleize(str, { removeBy, ...opts })

const protocol = url => {
  const { protocol = '' } = urlObject(url)
  return protocol.replace(':', '')
}

const isMediaTypeUrl = (url, type, { ext, ...opts } = {}) =>
  isUrl(url, opts) && isMediaTypeExtension(url, type, ext)

const isMediaTypeExtension = (url, type, ext) =>
  eq(type, get(EXTENSIONS, ext || extension(url)))

const isMediaUrl = (url, opts) =>
  isImageUrl(url, opts) || isVideoUrl(url, opts) || isAudioUrl(url, opts)

const isVideoUrl = (url, opts) => isMediaTypeUrl(url, VIDEO, opts)

const isAudioUrl = (url, opts) => isMediaTypeUrl(url, AUDIO, opts)

const isImageUrl = (url, opts) => isMediaTypeUrl(url, IMAGE, opts)

const isMediaExtension = url =>
  isImageExtension(url) || isVideoExtension(url) || isAudioExtension(url)

const isVideoExtension = url => isMediaTypeExtension(url, VIDEO)

const isAudioExtension = url => isMediaTypeExtension(url, AUDIO)

const isImageExtension = url => isMediaTypeExtension(url, IMAGE)

const extension = (str = '') => {
  const url = urlObject(
    str,
    isRelativeUrl(str) ? 'http://localhost' : undefined
  )
  url.hash = ''
  url.search = ''
  return fileExtension(url.toString())
}

const description = (value, opts) =>
  isString(value) ? getDescription(value, opts) : undefined

const getDescription = (
  str,
  { truncateLength = TRUNCATE_MAX_LENGTH, ...opts } = {}
) => {
  const description = removeLocation(truncate(str, truncateLength))
  return titleize(description, opts)
}

const publisher = value =>
  isString(value) ? condenseWhitespace(value) : undefined

const author = (value, opts) =>
  isAuthor(value) ? getAuthor(value, opts) : undefined

const url = (value, { url = '' } = {}) => {
  if (isEmpty(value)) return undefined

  try {
    const absoluteUrl = normalizeUrl(url, value)
    if (isUrl(absoluteUrl)) return absoluteUrl
  } catch (_) {}

  return isUri(value) ? value : undefined
}

const getISODate = date =>
  date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined

const date = value => {
  if (isDate(value)) return value.toISOString()
  if (!(isString(value) || isNumber(value))) return undefined

  // remove whitespace for easier parsing
  if (isString(value)) value = condenseWhitespace(value)

  // convert isodates to restringify, because sometimes they are truncated
  if (isIso(value)) return new Date(value).toISOString()

  if (/^\d{4}$/.test(value)) return new Date(toString(value)).toISOString()

  let isoDate

  if (isString(value)) {
    for (const item of value.split('\n').filter(Boolean)) {
      const parsed = chrono.parseDate(item)
      isoDate = getISODate(parsed)
      if (isoDate) break
    }
  } else {
    if (value >= 1e16 || value <= -1e16) {
      // nanoseconds
      value = Math.floor(value / 1000000)
    } else if (value >= 1e14 || value <= -1e14) {
      // microseconds
      value = Math.floor(value / 1000)
    } else if (!(value >= 1e11) || value <= -3e10) {
      // seconds
      value = value * 1000
    }
    isoDate = getISODate(new Date(value))
  }

  return isoDate
}

const lang = input => {
  if (isEmpty(input) || !isString(input)) return undefined
  const key = toLower(condenseWhitespace(input))
  if (input.length === 3) return iso6393[key]
  const lang = toLower(key.substring(0, 2))
  return includes(iso6393Values, lang) ? lang : undefined
}

const title = (value, { removeSeparator = false, ...opts } = {}) =>
  isString(value) ? titleize(value, { removeSeparator, ...opts }) : undefined

const isMime = (contentType, type) => {
  const ext = mimeTypes.extension(contentType)
  return eq(type, get(EXTENSIONS, ext))
}

memoizeOne.EqualityUrlAndHtmlDom = (newArgs, oldArgs) =>
  newArgs[0] === oldArgs[0] && newArgs[1].html() === oldArgs[1].html()

const jsonld = memoizeOne(
  $ =>
    $('script[type="application/ld+json"]')
      .map((i, e) => {
        try {
          return JSON.parse(
            $(e)
              .contents()
              .text()
          )
        } catch (_) {
          return undefined
        }
      })
      .get()
      .filter(Boolean),
  (newArgs, oldArgs) => newArgs[0].html() === oldArgs[0].html()
)

const $jsonld = propName => $ => {
  const collection = jsonld($)
  let value

  collection.find(item => {
    value = get(item, propName)
    return !isEmpty(value) || isNumber(value) || isBoolean(value)
  })

  return isString(value) ? decodeHTML(value) : value
}

const image = (value, opts) => {
  const urlValue = url(value, opts)
  return !isAudioUrl(urlValue, opts) && !isVideoUrl(urlValue, opts)
    ? urlValue
    : undefined
}

const logo = image

const video = (value, opts) => {
  const urlValue = url(value, opts)
  return isVideoUrl(urlValue, opts) ? urlValue : undefined
}

const audio = (value, opts) => {
  const urlValue = url(value, opts)
  return isAudioUrl(urlValue, opts) ? urlValue : undefined
}

const validator = {
  audio,
  author,
  date,
  description,
  image,
  lang,
  logo,
  publisher,
  title,
  url,
  video
}

const truthyTest = () => true

const findRule = async (rules, args) => {
  let index = 0
  let value

  do {
    const rule = rules[index++]
    const test = rule.test || truthyTest
    if (test(args)) value = await rule(args)
  } while (!has(value) && index < rules.length)

  return value
}

const toRule = (mapper, opts) => rule => async ({ htmlDom, url }) => {
  const value = await rule(htmlDom, url)
  return mapper(value, { url, ...opts })
}

const composeRule = rule => ({ from, to = from, ...opts }) => async ({
  htmlDom,
  url
}) => {
  const data = await rule(htmlDom, url)
  const value = get(data, from)
  return invoke(validator, to, value, { url, ...opts })
}

const has = value =>
  value !== undefined && !Number.isNaN(value) && hasValues(value)

const domLoaded = dom =>
  new Promise(resolve =>
    dom.window.document.readyState === 'interactive' ||
    dom.window.document.readyState === 'complete'
      ? resolve()
      : dom.window.document.addEventListener('DOMContentLoaded', resolve)
  )

const loadIframe = (url, html) =>
  new Promise(resolve => {
    const dom = new JSDOM(html, {
      url,
      virtualConsole: new VirtualConsole(),
      runScripts: 'dangerously',
      resources: 'usable'
    })

    const getIframe = () => dom.window.document.querySelector('iframe')

    const load = iframe =>
      iframe
        ? iframe.addEventListener('load', () => resolve(iframe.contentWindow))
        : resolve()

    const iframe = getIframe()
    if (iframe) return load(iframe)

    domLoaded(dom).then(() => load(getIframe()))
  })

module.exports = {
  $filter,
  $jsonld,
  absoluteUrl,
  audio,
  audioExtensions,
  author,
  composeRule,
  date,
  description,
  extension,
  findRule,
  has,
  image,
  imageExtensions,
  isArray,
  isAudioExtension,
  isAudioUrl,
  isAuthor,
  isImageExtension,
  isImageUrl,
  isMediaExtension,
  isMediaUrl,
  isMime,
  isString,
  isUrl,
  isVideoExtension,
  isVideoUrl,
  jsonld,
  lang,
  loadIframe,
  logo,
  memoizeOne,
  normalizeUrl,
  protocol,
  publisher,
  sanetizeUrl,
  title,
  titleize,
  toRule,
  url,
  validator,
  video,
  videoExtensions
}
