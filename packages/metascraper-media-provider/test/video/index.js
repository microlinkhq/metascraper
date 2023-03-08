'use strict'

const debug = require('debug-logfmt')('metascraper-media-provider:test')
const isCI = require('is-ci')
const test = require('ava')

const { metascraper } = require('../helpers')

const { extension, isUrl } = require('@metascraper/helpers')

;[
  // TODO: uncomment when the issue is resolved
  // https://github.com/ytdl-org/youtube-dl/issues/29205
  // 'https://vimeo.com/channels/staffpicks/287117046',
  // 'https://vimeo.com/showcase/3717822',
  'https://vimeo.com/443437002'
].forEach(url => {
  ;(isCI ? test.skip : test)(url, async t => {
    const metadata = await metascraper({ url })
    debug(metadata.video)
    t.is(extension(metadata.video), 'mp4')
  })
})
;['https://www.youtube.com/watch?v=hwMkbaS_M_c'].forEach(url => {
  test(url, async t => {
    const metadata = await metascraper({ url })
    debug(metadata.video)
    t.true(isUrl(metadata.video))
  })
})
;['https://www.instagram.com/p/BmYooZbhCfJ'].forEach(url => {
  ;(isCI ? test.skip : test)(url, async t => {
    const metadata = await metascraper({ url })
    debug(metadata.video)
    t.true(isUrl(metadata.video))
  })
})
;[
  'https://twitter.com/verge/status/957383241714970624',
  'https://twitter.com/telediario_tve/status/1036860275859775488',
  'https://twitter.com/futurism/status/882987478541533189'
].forEach(url => {
  test(url, async t => {
    const metadata = await metascraper({ url })
    debug(metadata.video)
    t.true(isUrl(metadata.video))
  })
})
;[
  'https://www.facebook.com/natgeo/videos/10156364216738951/',
  'https://www.facebook.com/cnn/videos/10157803903591509/'
].forEach(url => {
  ;(isCI ? test.skip : test)(url, async t => {
    const metadata = await metascraper({ url })
    debug(metadata.video)
    t.true(isUrl(metadata.video))
  })
})
