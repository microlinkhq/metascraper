'use strict'

const condenseWhitespace = require('condense-whitespace')
const isRelativeUrl = require('is-relative-url')
const { resolve: resolveUrl } = require('url')
const sanetizeUrl = require('normalize-url')
const smartquotes = require('smartquotes')
const toTitle = require('to-title-case')
const urlRegex = require('url-regex')
const { flow } = require('lodash')

const isUrl = value => urlRegex().test(value)

const normalizeUrl = url => sanetizeUrl(url, { stripWWW: false })

const getAbsoluteUrl = (url, baseUrl) =>
  isRelativeUrl(url) ? resolveUrl(baseUrl, url) : url

const getUrl = (url, baseUrl) => normalizeUrl(getAbsoluteUrl(url, baseUrl))

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
