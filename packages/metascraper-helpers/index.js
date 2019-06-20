'use strict'

const {
  castArray,
  chain,
  eq,
  first,
  flow,
  get,
  includes,
  isArray,
  isEmpty,
  isNumber,
  isString,
  lte,
  replace,
  size,
  toLower,
  trim,
  invoke
} = require('lodash')

const langs = require('iso-639-3').map(({ iso6391 }) => iso6391)
const condenseWhitespace = require('condense-whitespace')
const urlRegex = require('url-regex')({ exact: true })

const isRelativeUrl = require('is-relative-url')
const fileExtension = require('file-extension')
const { resolve: resolveUrl } = require('url')
const _normalizeUrl = require('normalize-url')
const smartquotes = require('smartquotes')
const { decodeHTML } = require('entities')
const mimeTypes = require('mime-types')
const chrono = require('chrono-node')
const truncate = require('truncate')
const isIso = require('isostring')
const toTitle = require('title')
const isUri = require('is-uri')
const { URL } = require('url')
const urlLib = require('url')
const mem = require('mem')

const VIDEO = 'video'
const AUDIO = 'audio'
const IMAGE = 'image'

const imageExtensions = chain(require('image-extensions'))
  .reduce((acc, ext) => ({ ...acc, [ext]: IMAGE }), {})
  .value()

const audioExtensions = chain(require('audio-extensions'))
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

const REGEX_BY = /^[\s\n]*by|@[\s\n]*/i

const REGEX_LOCATION = /^[A-Z\s]+\s+[-—–]\s+/

const REGEX_TITLE_SEPARATOR = /^[^|\-/•—]+/

const TRUNCATE_MAX_LENGTH = 300

const AUTHOR_MAX_LENGTH = 128

const removeLocation = value => replace(value, REGEX_LOCATION, '')

const isUrl = (url, { relative = false } = {}) =>
  relative ? isRelativeUrl(url) || urlRegex.test(url) : urlRegex.test(url)

const absoluteUrl = (baseUrl, relativePath) => {
  if (isEmpty(relativePath)) return baseUrl
  return resolveUrl(baseUrl, relativePath)
}

const sanetizeUrl = (url, opts) =>
  _normalizeUrl(url, {
    stripWWW: false,
    sortQueryParameters: false,
    removeTrailingSlash: false,
    ...opts
  })

const normalizeUrl = (baseUrl, relativePath, opts) => {
  return sanetizeUrl(absoluteUrl(baseUrl, relativePath), opts)
}

const removeBy = flow([value => value.replace(REGEX_BY, ''), trim])

const removeSeparator = title => {
  let newTitle = (REGEX_TITLE_SEPARATOR.exec(title) || [])[0] || title
  return newTitle.trim()
}

const createTitle = flow([condenseWhitespace, smartquotes])

const titleize = (src, opts = {}) => {
  let title = createTitle(src)
  if (opts.removeBy) title = removeBy(title)
  if (opts.removeSeparator) title = removeSeparator(title)
  if (opts.capitalize) title = toTitle(title)
  return title
}

const defaultFn = el => el.text().trim()

const $filter = ($, domNodes, fn = defaultFn) => {
  const el = domNodes.filter((i, el) => fn($(el))).first()
  return fn(el)
}

const isAuthor = (str, opts = { relative: false }) =>
  !isUrl(str, opts) &&
  !isEmpty(str) &&
  isString(str) &&
  lte(size(str), AUTHOR_MAX_LENGTH)

const getAuthor = (str, opts = { removeBy: true }) => titleize(str, opts)

const protocol = url => {
  const { protocol = '' } = new URL(url)
  return protocol.replace(':', '')
}

const isMediaTypeUrl = (url, type, opts) =>
  isUrl(url, opts) && isMediaTypeExtension(url, type)

const isMediaTypeExtension = (url, type) =>
  eq(type, get(EXTENSIONS, extension(url)))

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
  const urlObj = urlLib.parse(str)
  urlObj.hash = ''
  urlObj.search = ''
  return fileExtension(urlLib.format(urlObj))
}

const description = value => isString(value) && getDescription(value)

const getDescription = (str, opts) => {
  const description = removeLocation(truncate(str, TRUNCATE_MAX_LENGTH))
  return titleize(description, opts)
}

const publisher = value => isString(value) && condenseWhitespace(value)

const author = value => isAuthor(value) && getAuthor(value)

const url = (value, { url = '' } = {}) => {
  if (isEmpty(value)) return null

  try {
    const absoluteUrl = normalizeUrl(url, value)
    if (isUrl(absoluteUrl)) return absoluteUrl
  } catch (err) {}

  return isUri(value) ? value : null
}

const date = value => {
  if (!(isString(value) || isNumber(value))) return false

  // remove whitespace for easier parsing
  if (isString(value)) trim(value)

  // convert isodates to restringify, because sometimes they are truncated
  if (isIso(value)) return new Date(value).toISOString()

  // try to parse with the built-in date parser
  const native = new Date(value)
  if (!isNaN(native.getTime())) return native.toISOString()

  // try to parse a complex date string
  const parsed = chrono.parseDate(value)
  if (parsed) return parsed.toISOString()
}

const lang = value => {
  if (isEmpty(value)) return false
  const lang = toLower(value.trim().substring(0, 2))
  const isLang = includes(langs, lang)
  return isLang ? lang : false
}

const title = (value, { removeSeparator = true } = {}) =>
  isString(value) && titleize(value, { removeSeparator })

const isMime = (contentType, type) => {
  const ext = mimeTypes.extension(contentType)
  return eq(type, get(EXTENSIONS, ext))
}

const jsonld = mem(
  (url, $) => {
    let data = {}
    try {
      data = JSON.parse(
        $('script[type="application/ld+json"]')
          .first()
          .contents()
          .text()
      )
    } catch (err) {}
    return first(castArray(data))
  },
  { cacheKey: url => url }
)

const $jsonld = propName => ($, url) => {
  const json = jsonld(url, $)
  const value = get(json, propName)
  return isEmpty(value) ? value : decodeHTML(value)
}

const image = url

const logo = url

const video = (value, opts) => {
  const urlValue = url(value, opts)
  return isVideoUrl(urlValue) && urlValue
}

const audio = (value, opts) => {
  const urlValue = url(value, opts)
  return isAudioUrl(urlValue) && urlValue
}

const validator = {
  date,
  audio,
  author,
  video,
  title,
  publisher,
  image,
  logo,
  url,
  description,
  lang
}

/**
 * Create a property mapper with validator inside.
 */
const createValidator = fn => ({ from, to = from }) => async args => {
  const data = await fn(args)
  const value = get(data, from)
  return invoke(validator, to, value)
}

/**
 * Wrap a rule into a validator
 */
const createWrap = (fn, opts) => rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom, url)
  return fn(value, opts)
}

/**
 * Ward a rule only if `validator` returns `true`.
 */
const createWard = validator => fn => args =>
  validator(args) ? fn(args) : null

module.exports = {
  $filter,
  $jsonld,
  absoluteUrl,
  author,
  date,
  description,
  extension,
  isArray,
  isAuthor,
  isAudioExtension,
  isAudioUrl,
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
  normalizeUrl,
  protocol,
  publisher,
  sanetizeUrl,
  title,
  titleize,
  url,
  image,
  logo,
  audio,
  video,
  validator,
  createValidator,
  createWrap,
  createWard
}
