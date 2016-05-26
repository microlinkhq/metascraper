
/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap(rule) {
  return ($) => {
    const value = rule($)
    if (typeof value != 'string') return
    return value.trim()
  }
}

/**
 * Rules.
 */

module.exports = [
  wrap(($) => $('meta[property="og:description"]').attr('content')),
  wrap(($) => $('meta[name="twitter:description"]').attr('content')),
  wrap(($) => $('meta[name="description"]').attr('content')),
  wrap(($) => $('meta[name="sailthru.description"]').attr('content')),
  wrap(($) => $('meta[itemprop="description"]').attr('content')),
]
