
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
  wrap(($) => {
    const title = $('title').text().trim()
    const regexp = /^.*?\|\s+(.*)$/
    const matches = regexp.exec(title)
    if (!matches) return
    const [ full, publisher ] = matches
    return publisher
  }),
  wrap(($) => $('[itemtype="http://schema.org/Blog"] [itemprop="name"]').attr('content')),
  wrap(($) => {
    const desc = $('link[rel="alternate"][type="application/atom+xml"]').attr('title')
    const regexp = /^(.*?)\s[-|]\satom$/i
    const matches = regexp.exec(desc)
    if (!matches) return
    const [ full, title ] = matches
    return title
  })
]
