
const assert = require('assert')
const fs = require('fs')
const jsdom = require('jsdom')
const Metascraper = require('..')
const path = require('path')
const popsicle = require('popsicle')

/**
 * Tests.
 */

describe('server', () => {

  describe('rules', () => {
    testFixtures('rules')
  })

  describe('api', () => {
    it('scrapeUrl(url, rules)', () => {
      const url = 'http://www.vox.com/2016/5/24/11745294/donald-trump-hillary-clinton'
      return Metascraper.scrapeUrl(url).then((metadata) => {
        assert.deepEqual(metadata, {
          author: 'Jeff Stein',
          date: '2016-05-24T15:30:03.000Z',
          description: 'Donald Trump "certainly has a much better chance than most people are giving him," one pollster says.',
          image: 'https://cdn0.vox-cdn.com/thumbor/QYiWYl9YvQu44jM5b43sLSsJOQ4=/0x164:3000x1831/1080x600/cdn0.vox-cdn.com/uploads/chorus_image/image/49680847/GettyImages-533103972.0.jpg',
          publisher: 'Vox',
          title: 'We asked 5 pollsters if Donald Trump is really now ahead of Hillary Clinton',
          url: 'http://www.vox.com/2016/5/24/11745294/donald-trump-hillary-clinton',
        })
      })
    })

    it('scrapeHtml(html, rules)', () => {
      const url = 'http://www.vox.com/2016/5/24/11745294/donald-trump-hillary-clinton'
      return popsicle.get(url).then((res) => {
        const html = res.body
        return Metascraper.scrapeHtml(html).then((metadata) => {
          assert.deepEqual(metadata, {
            author: 'Jeff Stein',
            date: '2016-05-24T15:30:03.000Z',
            description: 'Donald Trump "certainly has a much better chance than most people are giving him," one pollster says.',
            image: 'https://cdn0.vox-cdn.com/thumbor/QYiWYl9YvQu44jM5b43sLSsJOQ4=/0x164:3000x1831/1080x600/cdn0.vox-cdn.com/uploads/chorus_image/image/49680847/GettyImages-533103972.0.jpg',
            publisher: 'Vox',
            title: 'We asked 5 pollsters if Donald Trump is really now ahead of Hillary Clinton',
            url: 'http://www.vox.com/2016/5/24/11745294/donald-trump-hillary-clinton',
          })
        })
      })
    })

    it('scrapeWindow(window, rules)', () => {
      const url = 'http://www.vox.com/2016/5/24/11745294/donald-trump-hillary-clinton'
      return env(url).then((window) => {
        return Metascraper.scrapeWindow(window).then((metadata) => {
          assert.deepEqual(metadata, {
            author: 'Jeff Stein',
            date: '2016-05-24T15:30:03.000Z',
            description: 'Donald Trump "certainly has a much better chance than most people are giving him," one pollster says.',
            image: 'https://cdn0.vox-cdn.com/thumbor/QYiWYl9YvQu44jM5b43sLSsJOQ4=/0x164:3000x1831/1080x600/cdn0.vox-cdn.com/uploads/chorus_image/image/49680847/GettyImages-533103972.0.jpg',
            publisher: 'Vox',
            title: 'We asked 5 pollsters if Donald Trump is really now ahead of Hillary Clinton',
            url: 'http://www.vox.com/2016/5/24/11745294/donald-trump-hillary-clinton',
          })
        })
      })
    })

    it('RULES', () => {
      assert.equal(typeof Metascraper.RULES, 'object')
    })
  })

  describe('cases', () => {
    testFixtures('cases')
  })

})

/**
 * Run tests for a fixtures `collection`.
 *
 * @param {String} collection
 */

function testFixtures(collection) {
  const dir = resolveFixture(collection)
  const children = fs.readdirSync(dir)

  for (const child of children) {
    it(child, () => {
      const inputFile = resolveFixture(collection, child, 'input.html')
      const outputFile = resolveFixture(collection, child, 'output.json')
      const rulesFile = resolveFixture(collection, child, 'rules.js')

      const input = fs.readFileSync(inputFile)
      const output = require(outputFile)
      const rules = fs.existsSync(rulesFile) ? require(rulesFile) : undefined

      return Metascraper
        .scrapeHtml(input, rules)
        .then((metadata) => {
          assert.deepEqual(metadata, output)
        })
    })
  }

}

/**
 * Resolve a fixture file by `...paths`.
 *
 * @param {String} ...paths
 * @return {String} path
 */

function resolveFixture(...paths) {
  return path.resolve(__dirname, 'fixtures', ...paths)
}

/**
 * Promisify JSDOM.
 *
 * @param {String} url
 * @return {Promise} promise
 */

function env(url) {
  return new Promise((resolve, reject) => {
    jsdom.env({
      url: url,
      done: (err, window) => {
        if (err) return reject(err)
        resolve(window)
      }
    })
  })
}
