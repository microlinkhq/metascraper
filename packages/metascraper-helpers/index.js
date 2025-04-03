'use strict'

const memoizeOne = require('memoize-one').default || require('memoize-one')
const debug = require('debug-logfmt')('metascraper:find-rule')
const condenseWhitespace = require('condense-whitespace')
const { getExtension: mimeExtension } = require('mime')
const capitalize = require('microsoft-capitalize')
const { JSDOM, VirtualConsole } = require('jsdom')
const isRelativeUrl = require('is-relative-url')
const fileExtension = require('file-extension')
const _normalizeUrl = require('normalize-url')
const smartquotes = require('smartquotes')
const { decodeHTML } = require('entities')
const iso6393 = require('iso-639-3/to-1')
const dataUri = require('data-uri-utils')
const hasValues = require('has-values')
const chrono = require('chrono-node')
const isIso = require('isostring')
const isUri = require('is-uri')
const { URL } = require('url')
const tldts = require('tldts')

const METASCRAPER_RE2 = process.env.METASCRAPER_RE2
  ? process.env.METASCRAPER_RE2 === 'true'
  : undefined

const urlRegexForTest = require('url-regex-safe')({
  exact: true,
  parens: true,
  re2: METASCRAPER_RE2
})

const urlRegexForMatch = require('url-regex-safe')({
  re2: METASCRAPER_RE2
})

const {
  chain,
  flow,
  get,
  invoke,
  isBoolean,
  isDate,
  isEmpty,
  isNumber,
  isString,
  lte,
  memoize,
  replace,
  size,
  toLower,
  toString
} = require('lodash')

const iso6393Values = Object.values(iso6393)

const parseUrl = memoize(tldts.parse)

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
const PDF = 'pdf'

const imageExtensions = chain(require('image-extensions'))
  .concat(['avif'])
  .reduce((acc, ext) => {
    acc[ext] = IMAGE
    return acc
  }, {})
  .value()

const audioExtensions = chain(require('audio-extensions'))
  .concat(['mpga'])
  .difference(['mp4'])
  .reduce((acc, ext) => {
    acc[ext] = AUDIO
    return acc
  }, {})
  .value()

const videoExtensions = chain(require('video-extensions'))
  .reduce((acc, ext) => {
    acc[ext] = VIDEO
    return acc
  }, {})
  .value()

const EXTENSIONS = {
  ...imageExtensions,
  ...audioExtensions,
  ...videoExtensions,
  [PDF]: PDF
}

const REGEX_BY = /^[\s\n]*by[\s\n]+|@[\s\n]*/i

const REGEX_LOCATION = /^[A-Z\s]+\s+[-—–]\s+/

const REGEX_TITLE_SEPARATOR = /^[^|\-/•—]+/

const AUTHOR_MAX_LENGTH = 128

const removeLocation = value => replace(value, REGEX_LOCATION, '')

const isUrl = (url, { relative = false } = {}) =>
  relative ? isRelativeUrl(url) : urlRegexForTest.test(url)

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
    removeSingleSlash: false,
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

const $filter = ($, matchedEl, fn = $filter.fn) => {
  let matched

  matchedEl.each(function () {
    const result = fn($(this))

    if (result) {
      matched = result
      return false
    }
  })

  return matched
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

const isExtension = (url, type, ext = extension(url)) =>
  type === EXTENSIONS[ext]

const isExtensionUrl = (url, type, { ext, ...opts } = {}) =>
  isUrl(url, opts) && isExtension(url, type, ext)

const createIsUrl = type => (url, opts) => isExtensionUrl(url, type, opts)

const isVideoUrl = createIsUrl(VIDEO)

const isAudioUrl = createIsUrl(AUDIO)

const isImageUrl = createIsUrl(IMAGE)

const isPdfUrl = createIsUrl(PDF)

const isMediaUrl = (url, opts) =>
  isImageUrl(url, opts) || isVideoUrl(url, opts) || isAudioUrl(url, opts)

const isMediaExtension = url =>
  isImageExtension(url) || isVideoExtension(url) || isAudioExtension(url)

const createIsExtension = type => url => isExtension(url, type)

const isVideoExtension = createIsExtension(VIDEO)

const isAudioExtension = createIsExtension(AUDIO)

const isImageExtension = createIsExtension(IMAGE)

const isPdfExtension = createIsExtension(PDF)

const isContentType =
  extensions =>
    ({ type = '' } = {}) =>
      extensions.some(extension => type.endsWith(extension))

const isVideoContentType = isContentType(Object.keys(videoExtensions))

const isAudioContentType = isContentType(Object.keys(audioExtensions))

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
  { truncateLength = Number.MAX_SAFE_INTEGER, ellipsis = '…', ...opts } = {}
) => {
  let truncated = str.slice(0, truncateLength)
  if (truncated.length < str.length) truncated = truncated.trim() + ellipsis
  const description = removeLocation(truncated)
  return titleize(description, opts).replace(/\s?\.\.\.?$/, ellipsis)
}

const publisher = value =>
  isString(value) ? condenseWhitespace(value) : undefined

const author = (value, opts) =>
  isAuthor(value) ? getAuthor(value, opts) : undefined

const url = (value, { url = '' } = {}) => {
  if (!isString(value) || isEmpty(value)) return

  try {
    const absoluteUrl = normalizeUrl(url, value)
    if (isUrl(absoluteUrl)) return absoluteUrl
  } catch (_) {}

  let sanitizedValue = value
  if (value.startsWith('data:')) {
    const [header, data] = value.split(',')
    const cleanData = data.replace(/\s+/g, '')
    sanitizedValue = `${header},${cleanData}`
  }

  return isUri(sanitizedValue) ? sanitizedValue : undefined
}

const getISODate = date =>
  date && !Number.isNaN(date.getTime()) ? date.toISOString() : undefined

const date = value => {
  if (isDate(value)) return value.toISOString()
  if (!(isString(value) || isNumber(value))) return

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
  if (isEmpty(input) || !isString(input)) return
  const key = toLower(condenseWhitespace(input))
  if (input.length === 3) return iso6393[key]
  const lang = toLower(key.substring(0, 2))
  return iso6393Values.includes(lang) ? lang : undefined
}

const title = (value, { removeSeparator = false, ...opts } = {}) =>
  isString(value) ? titleize(value, { removeSeparator, ...opts }) : undefined

const isMime = (contentType, type) =>
  type === get(EXTENSIONS, mimeExtension(contentType))

memoizeOne.EqualityUrlAndHtmlDom = (newArgs, oldArgs) =>
  newArgs[0] === oldArgs[0] && newArgs[1].html() === oldArgs[1].html()

memoizeOne.EqualityFirstArgument = (newArgs, oldArgs) =>
  newArgs[0] === oldArgs[0]

const jsonld = memoizeOne(
  $ =>
    $('script[type="application/ld+json"]')
      .map((_, element) => {
        try {
          const el = $(element)
          const json = JSON.parse($(el).contents().text())
          const { '@graph': graph, ...props } = json
          if (!graph) return json
          return graph.map(item => ({ ...props, ...item }))
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

  const result =
    urlValue !== undefined &&
    !isAudioUrl(urlValue, opts) &&
    !isVideoUrl(urlValue, opts)
      ? urlValue
      : undefined

  if (!dataUri.test(result)) return result
  const buffer = dataUri.toBuffer(dataUri.normalize(result))
  return buffer.length ? result : undefined
}

const logo = image

const media = (urlValidator, contentTypeValidator) => (value, opts) => {
  const urlValue = url(value, opts)
  return urlValidator(urlValue, opts) || contentTypeValidator(opts)
    ? urlValue
    : undefined
}

const video = media(isVideoUrl, isVideoContentType)

const audio = media(isAudioUrl, isAudioContentType)

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

const findRule = async (rules, args, propName) => {
  let index = 0
  let value

  do {
    const rule = rules[index++]
    const test = rule.test || truthyTest
    if (test(args)) {
      const duration = debug.duration()
      value = await rule(args)
      duration(`${rule.pkgName}:${propName}:${index - 1}:${has(value)}`)
    }
  } while (!has(value) && index < rules.length)

  return value
}

const toRule =
  (mapper, opts) =>
    rule =>
      async ({ htmlDom, url }) => {
        const value = await rule(htmlDom, url)
        return mapper(value, { url, ...opts })
      }

const composeRule =
  rule =>
    ({ from, to = from, ...opts }) =>
      async ({ htmlDom, url }) => {
        const data = await rule(htmlDom, url)
        const value = get(data, from)
        return invoke(validator, to, value, { url, ...opts })
      }

const has = value =>
  value !== undefined && !Number.isNaN(value) && hasValues(value)

const loadIframe = (url, $, { timeout = 5000 } = {}) =>
  new Promise(resolve => {
    const dom = new JSDOM($.html(), {
      url,
      virtualConsole: new VirtualConsole(),
      runScripts: 'dangerously',
      resources: 'usable'
    })

    const done = (html = '') => resolve($.load(html))

    const listen = (element, method, fn) =>
      element[`${method}EventListener`]('load', fn, {
        capture: true,
        once: true,
        passive: true
      })

    const iframe = dom.window.document.querySelector('iframe')
    if (!iframe) return done()

    const timer = setTimeout(() => {
      listen(iframe, 'remove', load)
      done()
    }, timeout)

    function load () {
      clearTimeout(timer)
      done(iframe.contentDocument.documentElement.outerHTML)
    }

    listen(iframe, 'add', load)
  })

const getUrls = input => String(input).match(urlRegexForMatch) ?? []

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
  fileExtension,
  findRule,
  getUrls,
  has,
  image,
  imageExtensions,
  isAudioExtension,
  isAudioUrl,
  isAuthor,
  isImageExtension,
  isImageUrl,
  isMediaExtension,
  isMediaUrl,
  isMime,
  isPdfExtension,
  isPdfUrl,
  isString,
  isUrl,
  isVideoExtension,
  isVideoUrl,
  iso6393,
  jsonld,
  lang,
  loadIframe,
  logo,
  memoizeOne,
  mimeExtension,
  normalizeUrl,
  parseUrl,
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
