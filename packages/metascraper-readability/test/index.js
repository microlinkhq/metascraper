'use strict'

const snapshot = require('snap-shot')
const path = require('path')
const fs = require('fs')

const metascraper = require('metascraper')([
  require('metascraper-readability')()
])

describe('metascraper-readability', () => {
  describe('.readability', function () {
    it('learnnode.com', async () => {
      const url = 'https://learnnode.com'
      const html = fs.readFileSync(
        path.resolve(__dirname, 'fixtures/learnnode.com.html'),
        'utf-8'
      )

      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })

    it('microlink.io', async () => {
      const url = 'https://microlink.io'
      const html = fs.readFileSync(
        path.resolve(__dirname, 'fixtures/microlink.io.html'),
        'utf-8'
      )
      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })

    it('kikobeats.com', async () => {
      const url = 'https://kikobeats.com'
      const html = fs.readFileSync(
        path.resolve(__dirname, 'fixtures/kikobeats.com.html'),
        'utf-8'
      )
      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })

    it('handle malformed HTML', async () => {
      const url =
        'https://tours.jamesphotographygroup.com/public/vtour/display/1754637'
      const html = fs.readFileSync(
        path.resolve(__dirname, 'fixtures/malformed.html'),
        'utf-8'
      )
      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })
  })
})
