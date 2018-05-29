'use strict'

const condenseWhitespace = require('condense-whitespace')
const { trim, flow, isEmpty } = require('lodash')
const isRelativeUrl = require('is-relative-url')
const { resolve: resolveUrl } = require('url')
const sanetizeUrl = require('normalize-url')
const smartquotes = require('smartquotes')
const toTitle = require('to-title-case')
const urlRegex = require('url-regex')

const REGEX_BY = /^[\s\n]*by|@[\s\n]*/i

const urlTest = (url, {relative = true}) => relative
  ? isRelativeUrl(url) || urlRegex().test(url)
  : urlRegex().test(url)

const isUrl = (url, opts = {}) => !isEmpty(url) && urlTest(url, opts)

const normalizeUrl = (url, opts) => sanetizeUrl(url, {
  stripWWW: false,
  sortQueryParameters: false,
  removeTrailingSlash: false,
  ...opts
})

const getAbsoluteUrl = (baseUrl, relativePath = '') => resolveUrl(baseUrl, relativePath)

const getUrl = (baseUrl, relativePath, opts) => (
  normalizeUrl(getAbsoluteUrl(baseUrl, relativePath), opts)
)

const removeByPrefix = flow([
  value => value.replace(REGEX_BY, ''),
  trim
])

const createTitle = flow([condenseWhitespace, smartquotes])

const titleize = (src, { capitalize = false, removeBy = false } = {}) => {
  let title = createTitle(src)
  if (removeBy) title = removeByPrefix(title).trim()
  if (capitalize) title = toTitle(title)
  return title
}

const defaultFn = el => el.text().trim()

const getValue = ($, collection, fn = defaultFn) => {
  const el = collection.filter((i, el) => fn($(el))).first()
  return fn(el)
}

module.exports = {
  titleize,
  getUrl,
  isUrl,
  normalizeUrl,
  getAbsoluteUrl,
  getValue
}
