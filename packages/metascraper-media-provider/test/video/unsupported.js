'use strict'

const { isUrl } = require('@metascraper/helpers')
const test = require('ava')

const { metascraper } = require('../helpers')

;[
  'https://www.apple.com/homepod',
  'https://www.imdb.com/title/tt5463162/',
  'https://anchor.fm/sin-humo/episodes/Episodio-9-Los-mandamientos-e22pro',
  'https://twitter.com/i/moments/1040691469118529536'
].forEach(url => {
  test(url, async t => {
    const metadata = await metascraper({ url })
    t.is(metadata.video, null)
  })
})

test('omit twitter 404 urls', async t => {
  const url = 'https://twitter.com/chenzonaut/status/456218458162601984'
  const metadata = await metascraper({ url })
  t.false(isUrl(metadata.video))
})
