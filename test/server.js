"use strict";

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
      const url = 'http://www.nytimes.com/2016/05/25/us/politics/republican-primary-schedule.html'
      return Metascraper.scrapeUrl(url).then((metadata) => {
        assert.deepEqual(metadata, {
          author: 'Jeremy W. Peters',
          date: '2016-05-24T18:42:05.000Z',
          description: 'Iowa and New Hampshire could lose their coveted status as gatekeepers to the presidency, and independents could be barred from voting in Republican contests.',
          image: 'https://static01.nyt.com/images/2016/05/25/us/25PRIMARYweb/25PRIMARYweb-facebookJumbo.jpg',
          publisher: 'NYTimes',
          title: 'Reeling From 2016 Chaos, G.O.P. Mulls Overhaul of Primaries',
          url: 'http://www.nytimes.com/2016/05/25/us/politics/republican-primary-schedule.html',
        })
      })
    })

    it('scrapeHtml(html, rules)', () => {
      const url = 'http://www.nytimes.com/2016/05/25/us/politics/republican-primary-schedule.html'
      const request = popsicle.request({
        url,
        options: { jar: popsicle.jar() }
      })

      return request.then((res) => {
        const html = res.body
        return Metascraper.scrapeHtml(html).then((metadata) => {
          assert.deepEqual(metadata, {
            author: 'Jeremy W. Peters',
            date: '2016-05-24T18:42:05.000Z',
            description: 'Iowa and New Hampshire could lose their coveted status as gatekeepers to the presidency, and independents could be barred from voting in Republican contests.',
            image: 'https://static01.nyt.com/images/2016/05/25/us/25PRIMARYweb/25PRIMARYweb-facebookJumbo.jpg',
            publisher: 'NYTimes',
            title: 'Reeling From 2016 Chaos, G.O.P. Mulls Overhaul of Primaries',
            url: 'http://www.nytimes.com/2016/05/25/us/politics/republican-primary-schedule.html',
          })
        })
      })
    })

    it('scrapeWindow(window, rules)', () => {
      const url = 'http://www.nytimes.com/2016/05/25/us/politics/republican-primary-schedule.html'
      return env(url).then((window) => {
        return Metascraper.scrapeWindow(window).then((metadata) => {
          assert.deepEqual(metadata, {
            author: 'Jeremy W. Peters',
            date: '2016-05-24T18:42:05.000Z',
            description: 'Iowa and New Hampshire could lose their coveted status as gatekeepers to the presidency, and independents could be barred from voting in Republican contests.',
            image: 'https://static01.nyt.com/images/2016/05/25/us/25PRIMARYweb/25PRIMARYweb-facebookJumbo.jpg',
            publisher: 'NYTimes',
            title: 'Reeling From 2016 Chaos, G.O.P. Mulls Overhaul of Primaries',
            url: 'http://www.nytimes.com/2016/05/25/us/politics/republican-primary-schedule.html',
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
