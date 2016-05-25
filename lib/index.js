
/**
 * Polyfills.
 */

import 'babel-core/register'
import 'babel-polyfill'

/**
 * Dependencies.
 */

import RULES from './rules'
import isHtml from 'is-html'
import isUrl from 'is-url'
import jsdom from 'jsdom'

/**
 * Promisify.
 */

function env(source) {
  return new Promise((resolve, reject) => {
    jsdom.env({
      ...source,
      done: (err, window) => {
        if (err) return reject(err)
        resolve(window)
      }
    })
  })
}

/**
 * Scrape metadata from input `source`.
 *
 * @param {Mixed} source
 * @param {Object} rules (optional)
 * @return {Object} metadata
 */

async function scrape(source, rules = RULES) {
  if (isUrl(source)) return await scrapeUrl(source, rules)
  if (isHtml(source)) return await scrapeHtml(source, rules)
  if (typeof source == 'object' && source.document) return await scrapeWindow(source, rules)
  throw new Error('Unknown source value! Please pass a URL, an HTML string, or a DOM window.')
}

/**
 * Scrape metadata from `url`.
 *
 * @param {String} url
 * @param {Object} rules (optional)
 * @return {Object} metadata
 */

async function scrapeUrl(url, rules = RULES) {
  const window = await env({ url })
  const metadata = await scrapeWindow(window, rules)
  return metadata
}

/**
 * Scrape metadata from `html`.
 *
 * @param {String} html
 * @param {Object} rules (optional)
 * @return {Object} metadata
 */

async function scrapeHtml(html, rules = RULES) {
  const window = await env({ html })
  const metadata = await scrapeWindow(window, rules)
  return metadata
}

/**
 * Scrape metadata from `window`.
 *
 * @param {Window} window
 * @param {Object} rules (optional)
 * @return {Object} metadata
 */

async function scrapeWindow(window, rules = RULES) {
  const metadata = {}

  for (const key in rules) {
    const array = rules[key]
    metadata[key] = await scrapeRules(window, array)
  }

  return metadata
}

/**
 * Scrape a value from a `rules` object.
 *
 * @param {Window} window
 * @param {Object} rules
 * @return {Mixed} value
 */

async function scrapeRules(window, rules) {
  for (const rule of rules) {
    const value = await rule(window)
    if (value != null) return value
  }

  return null
}

/**
 * Export.
 */

export {
  RULES,
  scrape,
  scrapeUrl,
  scrapeHtml,
  scrapeWindow,
}
