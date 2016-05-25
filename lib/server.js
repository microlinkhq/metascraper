
/**
 * Polyfills.
 */

import 'babel-core/register'
import 'babel-polyfill'

/**
 * Dependencies.
 */

import { RULES, scrapeWindow } from './common'
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
 * Export.
 */

export {
  RULES,
  scrapeUrl,
  scrapeHtml,
  scrapeWindow,
}
