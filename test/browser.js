
/**
 * Polyfills.
 */

import 'babel-core/register'
import 'babel-polyfill'
import 'source-map-support/register'

/**
 * Dependencies.
 */

import assert from 'assert'
import popsicle from 'popsicle'
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { scrapeUrl, scrapeHtml, scrapeWindow } from '../browser'

/**
 * Tests.
 */

describe('browser', () => {

  describe('scrapeWindow(window, rules)', () => {
    it('it should scrape from a provided dom', async () => {
      const metadata = await scrapeWindow(window)

      assert.deepEqual(metadata, {
        author: 'Ian Storm Taylor',
        date: '2016-05-25T01:37:24.265Z',
        description: 'Easily scrape metadata from articles on the web using Open Graph metadata, regular HTML metadata, and series of fallbacks.',
        image: null,
        publisher: 'Contents',
        title: 'Metascraper',
      })
    })
  })

})
