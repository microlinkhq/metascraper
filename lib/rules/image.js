
import isUrl from 'is-url'
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
    if (!isUrl(value)) return null
    return value
  }
}

/**
 * Rules.
 */

export default [
  wrap(meta('meta[property="og:image:secure_url"]')),
  wrap(meta('meta[property="og:image:url"]')),
  wrap(meta('meta[property="og:image"]')),
  wrap(meta('meta[name="twitter:image"]')),
  wrap(meta('meta[property="twitter:image"]')),
  wrap(meta('meta[name="twitter:image:src"]')),
  wrap(meta('meta[property="twitter:image:src"]')),
  wrap(meta('meta[name="sailthru.image"]')),
  wrap(meta('meta[name="sailthru.image.full"]')),
  wrap(meta('meta[name="sailthru.image.thumb"]')),
]
