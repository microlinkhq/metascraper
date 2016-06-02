
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
      const url = 'http://www.vox.com/2015/6/26/8849925/obama-obamacare-history-presidents'
      return Metascraper.scrapeUrl(url).then((metadata) => {
        assert.deepEqual(metadata, {
          author: 'Dylan Matthews',
          date: '2016-05-23T15:25:00.000Z',
          description: 'Clinton and Carter were middling at best. Obama is LBJ or FDR level.',
          image: 'https://cdn0.vox-cdn.com/thumbor/ppEZYJfAd9HYz3MRMBA6PLx6DtY=/0x0:3000x1667/1080x600/cdn0.vox-cdn.com/uploads/chorus_image/image/46741032/GettyImages-480656886.0.jpg',
          publisher: 'Vox',
          title: 'Barack Obama is officially one of the most consequential presidents in American history',
          url: 'http://www.vox.com/2015/6/26/8849925/obama-obamacare-history-presidents',
        })
      })
    })

    it('scrapeHtml(html, rules)', () => {
      const url = 'http://www.vox.com/2015/6/26/8849925/obama-obamacare-history-presidents'
      return popsicle.get(url).then((res) => {
        const html = res.body
        return Metascraper.scrapeHtml(html).then((metadata) => {
          assert.deepEqual(metadata, {
            author: 'Dylan Matthews',
            date: '2016-05-23T15:25:00.000Z',
            description: 'Clinton and Carter were middling at best. Obama is LBJ or FDR level.',
            image: 'https://cdn0.vox-cdn.com/thumbor/ppEZYJfAd9HYz3MRMBA6PLx6DtY=/0x0:3000x1667/1080x600/cdn0.vox-cdn.com/uploads/chorus_image/image/46741032/GettyImages-480656886.0.jpg',
            publisher: 'Vox',
            title: 'Barack Obama is officially one of the most consequential presidents in American history',
            url: 'http://www.vox.com/2015/6/26/8849925/obama-obamacare-history-presidents',
          })
        })
      })
    })

    it('scrapeWindow(window, rules)', () => {
      const url = 'http://www.vox.com/2015/6/26/8849925/obama-obamacare-history-presidents'
      return env(url).then((window) => {
        return Metascraper.scrapeWindow(window).then((metadata) => {
          assert.deepEqual(metadata, {
            author: 'Dylan Matthews',
            date: '2016-05-23T15:25:00.000Z',
            description: 'Clinton and Carter were middling at best. Obama is LBJ or FDR level.',
            image: 'https://cdn0.vox-cdn.com/thumbor/ppEZYJfAd9HYz3MRMBA6PLx6DtY=/0x0:3000x1667/1080x600/cdn0.vox-cdn.com/uploads/chorus_image/image/46741032/GettyImages-480656886.0.jpg',
            publisher: 'Vox',
            title: 'Barack Obama is officially one of the most consequential presidents in American history',
            url: 'http://www.vox.com/2015/6/26/8849925/obama-obamacare-history-presidents',
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
