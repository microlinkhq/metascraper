
import RULES from './rules'

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
  scrapeWindow,
}
