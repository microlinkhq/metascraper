
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
import jsdom from 'jsdom'
import metascraper from '..'
import popsicle from 'popsicle'
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { scrapeUrl, scrapeHtml, scrapeWindow } from '..'

/**
 * Promisify.
 */

function env(source) {
  return new Promise((resolve, reject) => {
    jsdom.env({
      ...source,
      done: (err, window) => {
        if (err) return reject(err)
        resolve(window)
      }
    })
  })
}

/**
 * Fixtures.
 */

const fixturesDir = resolve(__dirname, 'fixtures')
const fixtures = readdirSync(fixturesDir)

/**
 * Tests.
 */

describe('metascraper', () => {

  describe('scrapeUrl(url, rules)', () => {
    it('it should scrape from a url', async () => {
      const url = 'http://www.nytimes.com/2016/05/25/us/politics/republican-primary-schedule.html'
      const metadata = await scrapeUrl(url)

      assert.deepEqual(metadata, {
        author: 'Jeremy W. Peters',
        date: '2016-05-24T00:00:00.000Z',
        description: 'Nevada could lose its coveted early spot on the presidential nominating calendar, and independents could be barred from voting in Republican contests.',
        image: 'https://static01.nyt.com/images/2016/05/25/us/25PRIMARYweb/25PRIMARYweb-facebookJumbo.jpg',
        publisher: 'NYTimes',
        title: 'Reeling From 2016 Chaos, G.O.P. Mulls Overhaul of Primaries',
      })
    })
  })

  describe('scrapeHtml(html, rules)', () => {
    it('it should scrape from raw html', async () => {
      const url = 'http://www.vox.com/2016/5/24/11745294/donald-trump-hillary-clinton'
      const res = await popsicle(url)
      const html = res.body
      const metadata = await scrapeHtml(html)

      assert.deepEqual(metadata, {
        author: 'Jeff Stein',
        date: '2016-05-24T15:30:03.000Z',
        description: 'Donald Trump "certainly has a much better chance than most people are giving him," one pollster says.',
        image: 'https://cdn0.vox-cdn.com/thumbor/QYiWYl9YvQu44jM5b43sLSsJOQ4=/0x164:3000x1831/1080x600/cdn0.vox-cdn.com/uploads/chorus_image/image/49680847/GettyImages-533103972.0.jpg',
        publisher: 'Vox',
        title: 'We asked 5 pollsters if Donald Trump is really now ahead of Hillary Clinton',
      })
    })
  })

  describe('scrapeWindow(html, rules)', () => {
    it('it should scrape from a provided dom', async () => {
      const url = 'http://www.theverge.com/2016/5/24/11750454/otterbox-universe-expandable-case-system'
      const window = await env({ url })
      const metadata = await scrapeWindow(window)

      assert.deepEqual(metadata, {
        author: 'Jacob Kastrenakes',
        date: '2016-05-24T13:00:02.000Z',
        description: 'When you put a case on your phone, you usually give up the ability to add on more accessories — be it a new camera lens, a card reader, or extra storage. So OtterBox is trying to change that. It\'s...',
        image: 'https://cdn1.vox-cdn.com/thumbor/udnLcP6SyOO8IwLzJo0cqPC7NbM=/0x600:5760x3840/1600x900/cdn0.vox-cdn.com/uploads/chorus_image/image/49669807/8L1A8380-Edit.0.0.jpg',
        publisher: 'The Verge',
        title: 'OtterBox made a modular case that lets you add and remove accessories',
      })
    })
  })

  describe('rules', () => {
    for (const dir of fixtures) {
      it(dir, async () => {
        const input = readFileSync(resolve(__dirname, 'fixtures', dir, 'input.html'), 'utf8')
        const output = require(resolve(__dirname, 'fixtures', dir, 'output.json'))
        const metadata = await scrapeHtml(input)
        assert.deepEqual(metadata, output)
      })
    }
  })

})
