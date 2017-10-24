
let isUrl = require('is-url')
let URL = require('url');


/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

function wrap(rule) {
  return ($, url) => {
    let value = rule($, url)
    if (typeof value != 'string') return

    // make sure it's a url
    value = value.trim()

    if (value.length < 1) return;

    //try and turn it into a URL on its own
    if (isUrl(value))
      return value; 
    else {
      var base = URL.parse(url);
      var resolved = URL.resolve(base.protocol + "//" + base.host, value);
      if (isUrl(resolved))
        return resolved;
    }
    return;
  }
}

/**
 * Rules.
 */

module.exports = [
  wrap(($) => $('meta[property="og:url"]').attr('content')),
  wrap(($) => $('meta[name="twitter:url"]').attr('content')),
  wrap(($) => $('link[rel="canonical"]').attr('href')),
  wrap(($, url) => url),
]
