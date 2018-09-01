'use strict'

const {
  toLower,
  replace,
  includes,
  isString,
  trim,
  flow,
  isEmpty
} = require('lodash')

const condenseWhitespace = require('condense-whitespace')
const videoExtensions = require('video-extensions').concat(['gif'])
const audioExtensions = require('audio-extensions')
const isRelativeUrl = require('is-relative-url')
const fileExtension = require('file-extension')
const { resolve: resolveUrl } = require('url')
const _normalizeUrl = require('normalize-url')
const smartquotes = require('smartquotes')
const chrono = require('chrono-node')
const urlRegex = require('url-regex')({ exact: true })
const isIso = require('isostring')
const toTitle = require('title')
const { URL } = require('url')

const REGEX_BY = /^[\s\n]*by|@[\s\n]*/i

const REGEX_LOCATION = /^[A-Z\s]+\s+[-—–]\s+/

const removeLocation = value => replace(value, REGEX_LOCATION, '')

const urlTest = (url, { relative = true }) =>
  relative ? isRelativeUrl(url) || urlRegex.test(url) : urlRegex.test(url)

const isUrl = (url, opts = {}) => !isEmpty(url) && urlTest(url, opts)

const absoluteUrl = (baseUrl, relativePath = '') =>
  resolveUrl(baseUrl, relativePath)

const sanetizeUrl = (url, opts) =>
  _normalizeUrl(url, {
    normalizeHttp: false,
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

const isVideoUrl = createUrlExtensionValidator(videoExtensions)

const isAudioUrl = createUrlExtensionValidator(audioExtensions)

const extension = url => fileExtension(url).split('?')[0]

const description = value => isString(value) && getDescription(value)

const getDescription = value =>
  titleize(removeLocation(value), { capitalize: false })

const publisher = value => isString(value) && condenseWhitespace(value)

const author = value => isAuthor(value) && getAuthor(value)

const url = (value, { url }) => isUrl(value) && normalizeUrl(url, value)

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

const lang = value => isString(value) && toLower(value.substring(0, 2))

const title = value => isString(value) && titleize(value)

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
  isUrl,
  isVideoUrl,
  isAudioUrl
}
