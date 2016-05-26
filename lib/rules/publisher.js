
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

    // remove whitespace and new lines
    value = value.trim()
    value = value.replace(/\n/mg, '')

    return value
  }
}

/**
 * Rules.
 */

module.exports = [
  wrap(($) => $('meta[property="og:site_name"]').attr('content')),
  wrap(($) => $('meta[name="application-name"]').attr('content')),
  wrap(($) => $('meta[property="al:android:app_name"]').attr('content')),
  wrap(($) => $('meta[property="al:iphone:app_name"]').attr('content')),
  wrap(($) => $('meta[property="al:ipad:app_name"]').attr('content')),
  wrap(($) => $('meta[name="publisher"]').attr('content')),
  wrap(($) => $('meta[name="Publisher"]').attr('content')),
  wrap(($) => $('meta[name="twitter:app:name:iphone"]').attr('content')),
  wrap(($) => $('meta[name="twitter:app:name:ipad"]').attr('content')),
  wrap(($) => $('meta[name="twitter:app:name:googleplay"]').attr('content')),
  wrap(($) => $('#logo').text()),
  wrap(($) => $('.logo').text()),
  wrap(($) => $('a[class*="brand"]').text()),
  wrap(($) => $('[class*="brand"]').text()),
  wrap(($) => $('[class*="logo"] a img[alt]').attr('alt')),
  wrap(($) => $('[class*="logo"] img[alt]').attr('alt')),
]
