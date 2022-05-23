'use strict'

const snapshot = require('snap-shot')
const { omit } = require('lodash')
const should = require('should')

const createMetascraper = (...args) =>
  require('metascraper')([require('..')(...args)])

const createHtml = meta =>
  `<!DOCTYPE html>
<html lang="en">
<head>${meta.join('/n')}</head>
<body></body>
</html>`.trim()

describe('metascraper-manifest', () => {
  describe('options', () => {
    it('keyvOpts', async () => {
      const cache = new Map()
      const url = 'https://test-webmanifest.vercel.app'
      const metascraper = createMetascraper({
        gotOpts: { retry: 0 },
        keyvOpts: { store: cache }
      })

      const metadataOne = await metascraper({
        url,
        html: createHtml(['<link rel="manifest" href="/" importance="low">'])
      })

      should(cache.size).be.equal(1)

      const item = cache.get(`${url}/`)
      should(!!item).be.true()
      should(!!metadataOne.logo).be.true()

      const metadataTwo = await metascraper({
        url: 'https://lolwerhere.com',
        html: createHtml(['<link rel="manifest" href="/" importance="low">'])
      })

      should(!!metadataTwo.logo).be.false()
      should(cache.size).be.equal(2)
    })
  })

  it('does nothing if manifest URL is not reachable', async () => {
    const metascraper = createMetascraper()
    const url = 'https://www.linkedin.com/company/audiense/'
    const html = createHtml([
      '<link rel="manifest" href="https://static-exp1.licdn.com/sc/h/8ekldmhv4d8prk5sml735t6np">'
    ])
    const metadata = await metascraper({ url, html })
    snapshot(metadata)
  })

  it('does nothing if icons field at manifest is not present', async () => {
    const metascraper = createMetascraper()
    const url = 'https://www.linkedin.com/company/audiense/'
    const html = createHtml([
      '<link rel="manifest" href="https://test-webmanifest.vercel.app?icons=false&name=Lumeris&short_name=Lumeris">'
    ])
    const metadata = await metascraper({ url, html })
    snapshot(metadata)
  })

  describe('providers', () => {
    it('vercel.com', async () => {
      const metascraper = createMetascraper()
      const url = 'https://vercel.com'
      const html = createHtml([
        '<link rel="manifest" href="/site.webmanifest" importance="low">'
      ])
      const metadata = await metascraper({ url, html })
      snapshot(metadata)
    })

    it('segment.com', async () => {
      const metascraper = createMetascraper()
      const url = 'https://segment.com/blog/scaling-nsq/'
      const html = createHtml([
        '<link rel="manifest" href="/blog/manifest.webmanifest">'
      ])
      const metadata = await metascraper({ url, html })
      snapshot(metadata)
    })

    it('youtube.com', async () => {
      const metascraper = createMetascraper()
      const url = 'https://www.youtube.com/feed/explore'
      const html = createHtml([
        '<link rel="manifest" href="/manifest.webmanifest" crossorigin="use-credentials">'
      ])
      const metadata = await metascraper({ url, html })
      snapshot(metadata)
    })

    it('twitter.com', async () => {
      const metascraper = createMetascraper()
      const url = 'https://twitter.com/explore'
      const html = createHtml([
        '<link rel="manifest" href="/manifest.json" crossorigin="use-credentials">'
      ])
      const metadata = await metascraper({ url, html })
      should(metadata.logo.startsWith('http')).be.true()
      snapshot(omit(metadata, ['logo']))
    })
  })
})
