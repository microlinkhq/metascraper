
let RULES = require('./rules')
let cheerio = require('cheerio')
let popsicle = require('popsicle')

/**
 * Scrape metadata from `html`.
 *
 * @param {String} html
 * @param {Object} rules (optional)
 * @return {Promise} metadata
 */

function scrapeHtml(html, rules) {
  return scrapeMetadata(html, '', rules)
}

/**
 * Scrape metadata from `url`.
 *
 * @param {String} url
 * @param {Object} rules (optional)
 * @return {Promise} metadata
 */

function scrapeUrl(url, rules) {
  let request = popsicle.request({
    url,
    options: {
      jar: process.browser ? null : popsicle.jar()
    }
  })

  return request.then((res) => {
    return scrapeMetadata(res.body, res.url, rules)
  })
}

/**
 * Scrape metadata from `window`.
 *
 * @param {Window} window
 * @param {Object} rules (optional)
 * @return {Promise} metadata
 */

function scrapeWindow(window, rules) {
  let html = window.document.documentElement.outerHTML
  let url = window.location.href
  return scrapeMetadata(html, url, rules)
}

/**
 * Scrape each entry in the metadata result dictionary in parallel.
 *
 * @param {String} html
 * @param {String} url
 * @param {Object} rules (optional)
 * @return {Promise} metadata
 */

function scrapeMetadata(html, url, rules) {
  rules = rules || RULES
  let keys = Object.keys(rules)
  let $ = cheerio.load(html)
  let promises = keys.map(key => scrapeMetadatum($, url, rules[key]))

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
 * @param {Array or Function} rules
 * @return {Promise} value
 */

function scrapeMetadatum($, url, rules) {
  if (!Array.isArray(rules)) rules = [rules]

  return rules.reduce((promise, rule) => {
    return promise.then((value) => {
      if (value != null && value !== '') return value
      let next = rule($, url)
      if (next != null && next !== '') return next
      return null
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
