'use strict'

const snapshot = require('snap-shot')
const should = require('should')

const metascraper = require('metascraper')([
  require('..')(),
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
      getVideo(getVideo(require('./fixtures/video/youtube.json')))
    })
  })

  describe('video', () => {
    it('unsupported urls', async () => {
      const urls = [
        'https://www.apple.com/homepod',
        'https://www.imdb.com/title/tt5463162/',
        'https://anchor.fm/sin-humo/episodes/Episodio-9-Los-mandamientos-e22pro',
        'https://twitter.com/i/moments/1040691469118529536'
      ]

      const promises = urls.map(url =>
        metascraper({ html: '<title></title>', url })
      )
      const metadata = await Promise.all(promises)
      metadata.forEach(({ video }) => should(video).be.null())
    })
    describe('vimeo', () => {
      ;[
        'https://vimeo.com/channels/staffpicks/287117046',
        'https://vimeo.com/186386161'
      ].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ html: '<title></title>', url })
          console.log(metadata.video)
          should(extension(metadata.video)).be.equal('mp4')
        })
      })
    })

    describe('youtube', () => {
      ;[
        'https://www.youtube.com/watch?v=gABW21GkFw8',
        'https://www.youtube.com/watch?v=hwMkbaS_M_c'
      ].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ html: '<title></title>', url })
          console.log(metadata.video)
          should(isUrl(metadata.video)).be.true()
        })
      })
    })

    describe('instagram', () => {
      ;['https://www.instagram.com/p/BmYooZbhCfJ'].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ html: '<title></title>', url })
          console.log(metadata.video)
          should(isUrl(metadata.video)).be.true()
        })
      })
    })

    describe('twitter', () => {
      ;[
        'https://twitter.com/verge/status/957383241714970624',
        'https://twitter.com/telediario_tve/status/1036860275859775488',
        'https://twitter.com/Mei_Gui8/status/1037374230785142785'
      ].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ html: '<title></title>', url })
          console.log(metadata.video)
          should(isUrl(metadata.video)).be.true()
        })
      })
    })

    describe('facebook', () => {
      ;[
        'https://www.facebook.com/afcajax/videos/1686831701364171',
        'https://www.facebook.com/cnn/videos/10157803903591509/'
      ].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ html: '<title></title>', url })
          console.log(metadata.video)
          should(isUrl(metadata.video)).be.true()
        })
      })
    })
  })

  describe('audio', () => {
    describe('youtube', () => {
      ;[
        'https://www.youtube.com/watch?v=gABW21GkFw8',
        'https://www.youtube.com/watch?v=hwMkbaS_M_c'
      ].forEach(url => {
        it(url, async () => {
          const metadata = await metascraper({ html: '<title></title>', url })
          console.log(metadata.audio)
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
          const metadata = await metascraper({ html: '<title></title>', url })
          console.log(metadata.audio)
          should(isUrl(metadata.audio)).be.true()
        })
      })
    })
  })
})
