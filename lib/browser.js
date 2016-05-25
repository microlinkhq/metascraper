
/**
 * Polyfills.
 */

import 'babel-core/register'
import 'babel-polyfill'

/**
 * Dependencies.
 */

import { RULES, scrapeWindow } from './common'
import fetch from 'isomorphic-fetch'

/**
 * Scrape metadata from `url`.
 *
 * @param {String} url
 * @param {Object} rules (optional)
 * @return {Object} metadata
 */

async function scrapeUrl(url, rules = RULES) {
  const res = await fetch(url)
  const html = await res.text()
  const metadata = await scrapeHtml(html, rules)
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
  const parser = new DOMParser()
  const document = parser.parseFromString(html, "text/html")
  const win = {
    ...window,
    document,
  }

  const metadata = await scrapeWindow(win, rules)
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
