'use strict'

const {
  difference,
  union,
  toLower,
  replace,
  includes,
  isString,
  trim,
  flow,
  isEmpty
} = require('lodash')

const imageExtensions = difference(require('image-extensions'), ['gif'])
const audioExtensions = difference(require('audio-extensions'), ['mp4'])
const videoExtensions = union(require('video-extensions'), ['gif'])
const langs = require('iso-639-3').map(({ iso6391 }) => iso6391)
const condenseWhitespace = require('condense-whitespace')
const urlRegex = require('url-regex')({ exact: true })
const isRelativeUrl = require('is-relative-url')
const fileExtension = require('file-extension')
const { resolve: resolveUrl } = require('url')
const _normalizeUrl = require('normalize-url')
const smartquotes = require('smartquotes')
const mimeTypes = require('mime-types')
const chrono = require('chrono-node')
const isIso = require('isostring')
const toTitle = require('title')

const { URL } = require('url')

const MIMES_EXTENSIONS = {
  audio: audioExtensions,
  video: videoExtensions,
  image: imageExtensions
}

const REGEX_BY = /^[\s\n]*by|@[\s\n]*/i

const REGEX_LOCATION = /^[A-Z\s]+\s+[-—–]\s+/

const removeLocation = value => replace(value, REGEX_LOCATION, '')

const isUrl = (url, { relative = false } = {}) =>
  relative ? isRelativeUrl(url) || urlRegex.test(url) : urlRegex.test(url)

const absoluteUrl = (baseUrl, relativePath = '') =>
  resolveUrl(baseUrl, relativePath)

const sanetizeUrl = (url, opts) =>
  _normalizeUrl(url, {
    stripWWW: false,
    sortQueryParameters: false,
    removeTrailingSlash: false,
    ...opts
  })

const normalizeUrl = (baseUrl, relativePath, opts) =>
  sanetizeUrl(absoluteUrl(baseUrl, relativePath), opts)

const removeByPrefix = flow([value => value.replace(REGEX_BY, ''), trim])

const createTitle = flow([condenseWhitespace, smartquotes])

const titleize = (src, { capitalize = false, removeBy = false } = {}) => {
  let title = createTitle(src)
  if (removeBy) title = removeByPrefix(title).trim()
  if (capitalize) title = toTitle(title)
  return title
}

const defaultFn = el => el.text().trim()

const $filter = ($, domNodes, fn = defaultFn) => {
  const el = domNodes.filter((i, el) => fn($(el))).first()
  return fn(el)
}

const isAuthor = (str, opts = { relative: false }) =>
  isString(str) && !isUrl(str, opts)

const getAuthor = (str, opts = { removeBy: true }) => titleize(str, opts)

const protocol = url => {
  const { protocol = '' } = new URL(url)
  return protocol.replace(':', '')
}

const createUrlExtensionValidator = collection => url =>
  isUrl(url) && includes(collection, extension(url))

const createExtensionValidator = collection => url =>
  includes(collection, extension(url))

const isVideoUrl = createUrlExtensionValidator(videoExtensions)

const isAudioUrl = createUrlExtensionValidator(audioExtensions)

const isImageUrl = createUrlExtensionValidator(imageExtensions)

const isVideoExtension = createExtensionValidator(videoExtensions)

const isAudioExtension = createExtensionValidator(audioExtensions)

const isImageExtension = createExtensionValidator(imageExtensions)

const extension = url => fileExtension(url).split('?')[0]

const description = value => isString(value) && getDescription(value)

const getDescription = value =>
  titleize(removeLocation(value), { capitalize: false })

const publisher = value => isString(value) && condenseWhitespace(value)

const author = value => isAuthor(value) && getAuthor(value)

const url = (value, { url }) => {
  if (isEmpty(value)) return false
  const absoluteUrl = normalizeUrl(url, value)
  return isUrl(absoluteUrl) && absoluteUrl
}

const date = value => {
  if (!value) return false

  // remove whitespace for easier parsing
  value = value.trim()

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

const title = value => isString(value) && titleize(value)

const isMime = (type, mime) => {
  const extension = mimeTypes.extension(type)
  const collection = MIMES_EXTENSIONS[extension]
  return includes(collection, mime)
}

module.exports = {
  author,
  title,
  lang,
  url,
  description,
  date,
  $filter,
  titleize,
  absoluteUrl,
  sanetizeUrl,
  extension,
  protocol,
  publisher,
  normalizeUrl,
  isMime,
  isUrl,
  isVideoUrl,
  isAudioUrl,
  isImageUrl,
  isVideoExtension,
  isAudioExtension,
  isImageExtension
}
