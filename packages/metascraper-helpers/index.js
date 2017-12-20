'use strict'

const condenseWhitespace = require('condense-whitespace')
const isRelativeUrl = require('is-relative-url')
const { resolve: resolveUrl } = require('url')
const sanetizeUrl = require('normalize-url')
const smartquotes = require('smartquotes')
const { flow, isNil } = require('lodash')
const toTitle = require('to-title-case')
const urlRegex = require('url-regex')

const isUrl = (url, {relative = true} = {}) => {
  if (isNil(url)) return false
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

module.exports = {
  titleize,
  getUrl,
  isUrl,
  normalizeUrl,
  getAbsoluteUrl
}
