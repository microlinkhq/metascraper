
/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap(rule) {
  return ($) => {
    let value = rule($)
    if (typeof value != 'string') return

    // remove extra whitespace
    value = value.replace(/\s+/g, ' ')
    value = value.trim()

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
  wrap(($) => $('.post-title').text()),
  wrap(($) => $('.entry-title').text()),
  wrap(($) => $('[itemtype="http://schema.org/BlogPosting"] [itemprop="name"]').text()),
  wrap(($) => $('h1[class*="title"] a').text()),
  wrap(($) => $('h1[class*="title"]').text()),
  wrap(($) => $('title').text()),
]
