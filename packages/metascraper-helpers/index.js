'use strict'

const condenseWhitespace = require('condense-whitespace')
const isRelativeUrl = require('is-relative-url')
const { resolve: resolveUrl } = require('url')
const sanetizeUrl = require('normalize-url')
const { flow, isString } = require('lodash')
const smartquotes = require('smartquotes')
const toTitle = require('to-title-case')
const urlRegex = require('url-regex')

const isUrl = (url, {relative = true} = {}) => {
  if (!isString(url)) return false
  if (!relative) return urlRegex().test(url)
  return isRelativeUrl(url) || urlRegex().test(url)
}

const normalizeUrl = url => sanetizeUrl(url, { stripWWW: false })

const getAbsoluteUrl = (baseUrl, relativePath = '') => (
  isRelativeUrl(relativePath)
    ? resolveUrl(baseUrl, relativePath)
    : relativePath
)

const getUrl = (baseUrl, relativePath) => (
  normalizeUrl(getAbsoluteUrl(baseUrl, relativePath))
)

const createTitle = flow([condenseWhitespace, smartquotes])

const titleize = (src, { capitalize = false } = {}) => {
  const title = createTitle(src)
  return capitalize ? toTitle(title) : title
}

const defaultFn = el => el.text().trim()

const getValue = ($, collection, fn = defaultFn) => {
  const el = collection.filter((i, el) => fn($(el))).first()
  return defaultFn(el)
}

module.exports = {
  titleize,
  getUrl,
  isUrl,
  normalizeUrl,
  getAbsoluteUrl,
  getValue
}
