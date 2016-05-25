
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
  wrap(meta('meta[property="og:site_name"]')),
  wrap(meta('meta[name="application-name"]')),
  wrap(meta('meta[property="al:android:app_name"]')),
  wrap(meta('meta[property="al:iphone:app_name"]')),
  wrap(meta('meta[property="al:ipad:app_name"]')),
  wrap(meta('meta[name="Publisher"]')),
  wrap(meta('meta[name="twitter:app:name:iphone"]')),
  wrap(meta('meta[name="twitter:app:name:ipad"]')),
  wrap(meta('meta[name="twitter:app:name:googleplay"]')),
]
