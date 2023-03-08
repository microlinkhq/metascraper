'use strict'

const debug = require('debug-logfmt')('metascraper-media-provider:test')
const isCI = require('is-ci')
const test = require('ava')

const { metascraper } = require('./helpers')

const { isUrl } = require('@metascraper/helpers')

;['https://www.youtube.com/watch?v=hwMkbaS_M_c'].forEach(url => {
  test(url, async t => {
    const metadata = await metascraper({ url })
    debug(metadata.audio)
    t.true(isUrl(metadata.audio))
  })
})
;[
  'https://www.facebook.com/afcajax/videos/1703670770008127',
  'https://www.facebook.com/cnn/videos/10157803903591509/'
].forEach(url => {
  ;(isCI ? test.skip : test)(url, async t => {
    const metadata = await metascraper({ url })
    debug(metadata.audio)
    t.true(isUrl(metadata.audio))
  })
})
;['https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'].forEach(
  url => {
    test(url, async t => {
      const metadata = await metascraper({ url })
      debug(metadata.audio)
      t.true(isUrl(metadata.audio))
    })
  }
)
