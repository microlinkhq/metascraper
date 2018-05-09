'use strict'

const condenseWhitespace = require('condense-whitespace')
const { trim, flow, isEmpty } = require('lodash')
const isRelativeUrl = require('is-relative-url')
const { resolve: resolveUrl, URL } = require('url')
const smartquotes = require('smartquotes')
const toTitle = require('to-title-case')
const urlRegex = require('url-regex')
const prependHttp = require('prepend-http')

const REGEX_BY = /^[\s\n]*by|@[\s\n]*/i
const REMOVE_QUERY_PARAMS = [/^utm_\w+/i]

const testParameter = (name, filters) => {
  return filters.some(filter => filter instanceof RegExp ? filter.test(name) : filter === name)
}

const urlTest = (url, {relative = true}) => relative
  ? isRelativeUrl(url) || urlRegex().test(url)
  : urlRegex().test(url)

const isUrl = (url, opts = {}) => !isEmpty(url) && urlTest(url, opts)

const normalizeUrl = (str) => {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }

  // Prepend protocol
  str = prependHttp(str.trim()).replace(/^\/\//, 'http://')

  const urlObj = new URL(str)

  if (!urlObj.hostname && !urlObj.pathname) {
    throw new Error('Invalid URL')
  }

  // Remove fragment
  urlObj.hash = ''

  if (urlObj.pathname) {
    // Remove duplicate slashes
    urlObj.pathname = urlObj.pathname.replace(/\/{2,}/g, '/')
  }

  if (urlObj.hostname) {
    // Remove trailing dot
    urlObj.hostname = urlObj.hostname.replace(/\.$/, '')
  }

  // Remove URL with empty query string
  if (urlObj.search === '?' || urlObj.search === '') {
    urlObj.search = ''
  }

  // Remove query unwanted parameters
  for (const key in urlObj.searchParams) {
    if (testParameter(key, REMOVE_QUERY_PARAMS)) {
      urlObj.searchParams.delete(key)
    }
  }

  // Take advantage of many of the Node `url` normalizations
  str = urlObj.toString()

  // Remove ending `/`
  str = str.replace(/\/$/, '')

  return str
}

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
