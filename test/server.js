
const assert = require('assert')
const jsdom = require('jsdom')
const popsicle = require('popsicle')
const fs = require('fs')
const path = require('path')
const metascraper = require('..')

const readdirSync = fs.readdirSync
const readFileSync = fs.readFileSync
const resolve = path.resolve

/**
 * Promisify.
 */

function env(source) {
  return new Promise((resolve, reject) => {
    jsdom.env({
      url: source.url,
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

describe('server', () => {

  describe('scrapeUrl(url, rules)', () => {
    it('it should scrape from a url', () => {
      const url = 'http://www.vox.com/2016/5/24/11745294/donald-trump-hillary-clinton'
      return metascraper.scrapeUrl(url).then((metadata) => {
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
  })

  describe('scrapeHtml(html, rules)', () => {
    it('it should scrape from raw html', () => {
      const url = 'http://www.vox.com/2016/5/24/11745294/donald-trump-hillary-clinton'
      return popsicle.get(url).then((res) => {
        const html = res.body
        return metascraper.scrapeHtml(html).then((metadata) => {
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
    })
  })

  describe('scrapeWindow(window, rules)', () => {
    it('it should scrape from a provided dom', () => {
      const url = 'http://www.vox.com/2016/5/24/11745294/donald-trump-hillary-clinton'
      return env({ url }).then((window) => {
        return metascraper.scrapeWindow(window).then((metadata) => {
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
    })
  })

  describe('rules', () => {
    for (const dir of fixtures) {
      it(dir, () => {
        const input = readFileSync(resolve(__dirname, 'fixtures', dir, 'input.html'), 'utf8')
        const output = require(resolve(__dirname, 'fixtures', dir, 'output.json'))
        return metascraper.scrapeHtml(input).then((metadata) => {
          assert.deepEqual(metadata, output)
        })
      })
    }
  })

})
