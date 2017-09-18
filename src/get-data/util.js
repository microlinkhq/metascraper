'use strict'

const isRelativeUrl = require('is-relative-url')
const {resolve: resolveUrl} = require('url')
const sanetizeUrl = require('normalize-url')
const urlRegex = require('url-regex')

const isUrl = value => urlRegex().test(value)
const normalizeUrl = url => sanetizeUrl(url, {stripWWW: false})
const getAbsoluteUrl = (url, baseUrl) => isRelativeUrl(url) ? resolveUrl(baseUrl, url) : url
const getUrl = (url, baseUrl) => normalizeUrl(getAbsoluteUrl(url, baseUrl))

module.exports = {
  getUrl,
  isUrl,
  normalizeUrl,
  getAbsoluteUrl
}
