'use strict'

const { readFile } = require('fs').promises
const snapshot = require('snap-shot')
const { resolve } = require('path')
const { omit } = require('lodash')
const should = require('should')

const metascraper = require('metascraper')([require('..')()])

describe('metascraper-video', () => {
  describe('image', () => {
    it('src:poster', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/source-poster.html')
      )
      const url = 'https://gfycat.com/gifs/detail/timelyhealthyarmadillo'
      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })
  })
  describe('video', () => {
    describe('<video />', () => {
      it('source:src', async () => {
        const html = await readFile(
          resolve(__dirname, 'fixtures/video-src.html')
        )
        const url =
          'https://www.theverge.com/2018/1/22/16921092/pentagon-secret-nuclear-bunker-reconstruction-minecraft-cns-miis-model'
        const metadata = await metascraper({ html, url })
        snapshot(metadata)
      })
      it('multiple source:src', async () => {
        const html = `
        <video controls>
          <source src="video-small.mp4" type="video/mp4" media="all and (max-width: 480px)">
          <source src="video-small.webm" type="video/webm" media="all and (max-width: 480px)">
          <source src="video.mp4" type="video/mp4">
          <source src="video.webm" type="video/webm">
        </video>
        `
        const url =
          'https://www.theverge.com/2018/1/22/16921092/pentagon-secret-nuclear-bunker-reconstruction-minecraft-cns-miis-model'
        const metadata = await metascraper({ html, url })
        snapshot(metadata)
      })
      it('multiple source:src with no valid video values', async () => {
        const html = await readFile(
          resolve(__dirname, 'fixtures/providers/bluecadet.com.html')
        )
        const url = 'https://www.bluecadet.com/'
        const metadata = await metascraper({ html, url })
        snapshot(metadata)
      })
    })
    it('<source src />', async () => {
      const html = await readFile(
        resolve(__dirname, 'fixtures/source-src.html')
      )
      const url = 'https://9gag.com/gag/aGjVLDK'

      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })
    it('og:video', async () => {
      const html = await readFile(resolve(__dirname, 'fixtures/tweet.html'))
      const url = 'https://twitter.com/_developit/status/955905369242513414'
      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })
    it('jsonld:contentUrl', async () => {
      const html = `<script type="application/ld+json">
        {"@context":"http://schema.org","@type":"VideoObject","@id":"https://example.com/video.mp4","contentUrl":"https://example.com/video.mp4"}
      </script>`
      const url = 'https://browserless.js.org'

      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })
    it('twitter:player', async () => {
      const html =
        '<meta name="twitter:player" content="https://twitter-card-player.vercel.app/container.html">'
      const url = 'https://twitter-card-player.vercel.app'

      const metadata = await metascraper({ html, url })
      snapshot(metadata)
    })
    describe('by providers', () => {
      it('clips.twitch.tv', async () => {
        const html = await readFile(
          resolve(__dirname, 'fixtures/providers/clip.twitch.tv.html')
        )
        const url = 'https://clips.twitch.tv/AwkwardBoredWaffleItsBoshyTime'
        const metadata = await metascraper({ html, url })
        snapshot(metadata)
      })

      it('play.tv', async () => {
        const html = await readFile(
          resolve(__dirname, 'fixtures/providers/play.tv.html')
        )
        const url = 'https://plays.tv/video/5a6f64b1bef69a7fa9/holy-shit'
        const metadata = await metascraper({ html, url })
        snapshot(omit(metadata, ['date']))
      })

      it('9gag', async () => {
        const html = await readFile(
          resolve(__dirname, 'fixtures/providers/9gag.html')
        )
        const url = 'https://9gag.com/gag/abY5Mm9'
        const metadata = await metascraper({ html, url })
        should(metadata.video.endsWith('.mp4')).be.true()
      })
    })
  })
})
