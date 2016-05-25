
import { meta } from '../create-rule'

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap(rule) {
  return async (window) => {
    const value = await rule(window)
    if (typeof value != 'string') return null
    return value
  }
}

/**
 * Rules.
 */

export default [
  wrap(meta('meta[property="og:description"]')),
  wrap(meta('meta[name="twitter:description"]')),
  wrap(meta('meta[name="description"]')),
  wrap(meta('meta[name="sailthru.description"]')),
  wrap(meta('meta[itemprop="description"]')),
]
