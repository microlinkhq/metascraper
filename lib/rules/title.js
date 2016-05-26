
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
    return value
  }
}

/**
 * Rules.
 */

module.exports = [
  wrap(($) => $('meta[property="og:title"]').attr('content')),
  wrap(($) => $('meta[name="twitter:title"]').attr('content')),
  wrap(($) => $('meta[name="sailthru.title"]').attr('content')),
  wrap(($) => $('title').text()),
]
