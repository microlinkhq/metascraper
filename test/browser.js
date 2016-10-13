
/**
 * Polyfills.
 */

require('babel-polyfill')

/**
 * Dependencies.
 */

const assert = require('assert')
const metascraper = require('..')

/**
 * Tests.
 */

describe('browser', () => {

  describe('scrapeWindow(window, rules)', () => {
    it('it should scrape from a provided dom', () => {
      return metascraper.scrapeWindow(window).then((metadata) => {
        assert.deepEqual(metadata, {
          author: 'Ian Storm Taylor',
          date: '2016-05-25T01:37:24.265Z',
          description: 'Easily scrape metadata from articles on the web using Open Graph metadata, regular HTML metadata, and series of fallbacks.',
          image: null,
          publisher: 'Contents',
          title: 'Metascraper',
          url: null
        })
      })
    })
  })

  describe('scrape({ html, url, window, rules })', () => {
    it('it should scrape from a provided dom', () => {
      return metascraper.scrape({ window }).then((metadata) => {
        assert.deepEqual(metadata, {
          author: 'Ian Storm Taylor',
          date: '2016-05-25T01:37:24.265Z',
          description: 'Easily scrape metadata from articles on the web using Open Graph metadata, regular HTML metadata, and series of fallbacks.',
          image: null,
          publisher: 'Contents',
          title: 'Metascraper',
          url: null
        })
      })
    })
  })

})
