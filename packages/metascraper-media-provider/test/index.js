'use strict'

const debug = require('debug-logfmt')('metascraper-media-provider:test')
const { getDomainWithoutSuffix } = require('tldts')
const parseProxyUri = require('parse-proxy-uri')
const snapshot = require('snap-shot')
const should = require('should')
const isCI = require('is-ci')

const { PROXY_PASSWORD, PROXY_USERNAME, PROXY_HOST } = process.env

const proxy =
  PROXY_PASSWORD && PROXY_USERNAME && PROXY_HOST
    ? parseProxyUri(
        `socks5://${PROXY_USERNAME}:${PROXY_PASSWORD}@${PROXY_HOST}`
      )
    : undefined

const PROXY_DOMAINS = ['vimeo', 'facebook']
const PROXY_URLS = ['https://api.twitter.com/1.1/guest/activate.json']

const getProxy = ({ url, retryCount }) => {
  if (retryCount !== 1) return false
  if (PROXY_URLS.includes(url)) return proxy
  if (PROXY_DOMAINS.includes(getDomainWithoutSuffix(url))) return proxy
  return false
}

const metascraper = require('metascraper')([
  require('..')({ getProxy, timeout: 15000 }),
  require('metascraper-publisher')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const { getVideo, getAudio } = require('..')
const { extension, isUrl } = require('@metascraper/helpers')

describe('metascraper-media-provider', () => {
  describe('.getVideo', () => {
    it('twitter', () => {
      snapshot(getVideo(require('./fixtures/provider/twitter.json')))
    })
    it('vimeo', () => {
      snapshot(getVideo(require('./fixtures/provider/vimeo.json')))
    })
    it('youtube', () => {
      snapshot(getVideo(require('./fixtures/provider/youtube.json')))
    })
    it('prefer a video url with audio', () => {
      snapshot(
        getVideo(require('./fixtures/provider/youtube-video-audio.json'))
      )
    })
    it('avoid m3u8', () => {
      snapshot(getVideo(require('./fixtures/m3u8.json')))
    })
  })

  describe('.getAudio', () => {
    it('mpga extension', () => {
      snapshot(getAudio(require('./fixtures/mpga.json')))
    })
  })

  describe('video', () => {
    describe('unsupported urls', async () => {
      ;[
        'https://www.apple.com/homepod',
        'https://www.imdb.com/title/tt5463162/',
        'https://anchor.fm/sin-humo/episodes/Episodio-9-Los-mandamientos-e22pro',
        'https://twitter.com/i/moments/1040691469118529536'
      ].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ url })
          should(metadata.video).be.null()
        })
      })
    })
    ;(isCI ? describe.skip : describe)('vimeo', () => {
      ;[
        // TODO: uncomment when the issue is resolved
        // https://github.com/ytdl-org/youtube-dl/issues/29205
        // 'https://vimeo.com/channels/staffpicks/287117046',
        // 'https://vimeo.com/showcase/3717822',
        'https://vimeo.com/443437002'
      ].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ url })
          debug(metadata.video)
          should(extension(metadata.video)).be.equal('mp4')
        })
      })
    })
    describe('youtube', () => {
      ;['https://www.youtube.com/watch?v=hwMkbaS_M_c'].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ url })
          debug(metadata.video)
          should(isUrl(metadata.video)).be.true()
        })
      })
    })
    ;(isCI ? describe.skip : describe)('instagram', () => {
      ;['https://www.instagram.com/p/BmYooZbhCfJ'].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ url })
          debug(metadata.video)
          should(isUrl(metadata.video)).be.true()
        })
      })
    })
    describe('twitter', () => {
      ;[
        'https://twitter.com/verge/status/957383241714970624',
        'https://twitter.com/telediario_tve/status/1036860275859775488',
        'https://twitter.com/futurism/status/882987478541533189'
      ].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ url })
          debug(metadata.video)
          should(isUrl(metadata.video)).be.true()
        })
      })

      it('omit 404 urls', async () => {
        const url = 'https://twitter.com/chenzonaut/status/456218458162601984'
        const metadata = await metascraper({ url })
        should(isUrl(metadata.video)).be.false()
      })
    })
    ;(isCI ? describe.skip : describe)('facebook', () => {
      ;[
        'https://www.facebook.com/natgeo/videos/10156364216738951/',
        'https://www.facebook.com/cnn/videos/10157803903591509/'
      ].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ url })
          debug(metadata.video)
          should(isUrl(metadata.video)).be.true()
        })
      })
    })
  })

  describe('audio', () => {
    describe('youtube', () => {
      ;['https://www.youtube.com/watch?v=hwMkbaS_M_c'].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ url })
          debug(metadata.audio)
          should(isUrl(metadata.audio)).be.true()
        })
      })
    })
    ;(isCI ? describe.skip : describe)('facebook', () => {
      ;[
        'https://www.facebook.com/afcajax/videos/1686831701364171',
        'https://www.facebook.com/cnn/videos/10157803903591509/'
      ].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ url })
          debug(metadata.audio)
          should(isUrl(metadata.audio)).be.true()
        })
      })
    })
    describe('soundcloud', () => {
      ;[
        'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'
      ].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ url })
          debug(metadata.audio)
          should(isUrl(metadata.audio)).be.true()
        })
      })
    })
  })
})
