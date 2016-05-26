
const RULES = require('./rules')
const fetch = require('isomorphic-fetch')
const cheerio = require('cheerio')

/**
 * Scrape metadata from `html`.
 *
 * @param {String} html
 * @param {Object} rules (optional)
 * @return {Promise} metadata
 */

function scrapeHtml(html, rules = RULES) {
  return scrapeMetadata(html, '', rules)
}

/**
 * Scrape metadata from `url`.
 *
 * @param {String} url
 * @param {Object} rules (optional)
 * @return {Promise} metadata
 */

function scrapeUrl(url, rules = RULES) {
  return fetch(url).then((res) => {
    return res.text().then((html) => {
      return scrapeMetadata(html, url, rules)
    })
  })
}

/**
 * Scrape metadata from `window`.
 *
 * @param {Window} window
 * @param {Object} rules (optional)
 * @return {Promise} metadata
 */

function scrapeWindow(window, rules = RULES) {
  const html = window.document.documentElement.outerHTML
  const url = window.location.href
  return scrapeMetadata(html, url, rules)
}

/**
 * Scrape each entry in the metadata result dictionary in parallel.
 *
 * @param {Cheerio} $
 * @param {String} url
 * @param {Object} rules
 * @return {Promise} metadata
 */

function scrapeMetadata(html, url, rules) {
  const keys = Object.keys(rules)
  const $ = cheerio.load(html)
  const promises = keys.map(key => scrapeMetadatum($, url, rules[key]))

  return Promise.all(promises).then((values) => {
    return keys.reduce((memo, key, i) => {
      memo[key] = values[i]
      return memo
    }, {})
  })
}

/**
 * Scrape the first non-null value returned by an array of `rules` functions for
 * a single property in the metadata result dictionary.
 *
 * @param {Cheerio} $
 * @param {String} url
 * @param {Array} rules
 * @return {Promise} value
 */

function scrapeMetadatum($, url, rules) {
  return rules.reduce((promise, rule) => {
    return promise.then((value) => {
      if (value != null) return value
      return rule($, url)
    })
  }, Promise.resolve())
}

/**
 * Export.
 */

module.exports = {
  RULES,
  scrapeHtml,
  scrapeUrl,
  scrapeWindow,
}
