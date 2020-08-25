'use strict'

const debug = require('debug-logfmt')('metascraper-media-provider:test')
const { getDomainWithoutSuffix } = require('tldts')
const parseProxy = require('parse-proxy-uri')
const snapshot = require('snap-shot')
const should = require('should')
const isCI = require('is-ci')

const proxy = parseProxy(process.env.PROXY_URI)

const PROXY_DOMAINS = ['vimeo']
const PROXY_URLS = ['https://api.twitter.com/1.1/guest/activate.json']

const getProxy = ({ url, retryCount = 1 }) => {
  if (retryCount === 0) return false
  if (PROXY_URLS.includes(url)) return proxy
  if (PROXY_DOMAINS.includes(getDomainWithoutSuffix(url))) return proxy
  return false
}

const metascraper = require('metascraper')([
  require('..')({ getProxy }),
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

const { getVideo } = require('..')
const { extension, isUrl } = require('@metascraper/helpers')

describe('metascraper-media-provider', () => {
  describe('.getVideo', () => {
    it('twitter', () => {
      snapshot(getVideo(require('./fixtures/video/twitter.json')))
    })
    it('vimeo', () => {
      snapshot(getVideo(require('./fixtures/video/vimeo.json')))
    })
    it('youtube', () => {
      snapshot(getVideo(require('./fixtures/video/youtube.json')))
    })
    it('prefer a video url with audio', () => {
      snapshot(getVideo(require('./fixtures/video/youtube-video-audio.json')))
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
        'https://vimeo.com/channels/staffpicks/287117046',
        'https://vimeo.com/186386161'
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
          console.log(metadata)
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

    describe('facebook', () => {
      ;[
        'https://www.facebook.com/afcajax/videos/1686831701364171',
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

    describe('facebook', () => {
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
