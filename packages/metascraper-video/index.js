'use strict'

const { getUrl, isUrl } = require('@metascraper/helpers')

/**
 * Wrap a rule with validation and formatting logic.
 *
 * @param {Function} rule
 * @return {Function} wrapped
 */

const wrap = rule => ({ htmlDom, url }) => {
  const value = rule(htmlDom)
  return isUrl(value) && getUrl(url, value)
}

/**
 * Rules.
 */

module.exports = () => ({
  image: [
    wrap($ => $('video').attr('poster'))
  ],
  video: [
    wrap($ => $('meta[property="og:video:secure_url"]').attr('content')),
    wrap($ => $('meta[property="og:video:url"]').attr('content')),
    wrap($ => $('meta[property="og:video"]').attr('content')),
    wrap($ => $('meta[property="twitter:player:stream"]').attr('content')),
    wrap($ => $('video').attr('src')),
    wrap($ => $('source').attr('src'))
  ]
})
