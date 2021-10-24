'use strict'

const snapshot = require('snap-shot')

const createMetascraperManifest = require('..')
const createMetascraper = require('metascraper')

const createHtml = meta =>
  `<!DOCTYPE html>
<html lang="en">
<head>${meta.join('/n')}</head>
<body></body>
</html>`.trim()

describe('metascraper-manifest', () => {
  it('vercel.com', async () => {
    const metascraper = createMetascraper([createMetascraperManifest()])
    const url = 'https://vercel.com'
    const html = createHtml([
      '<link rel="manifest" href="/site.webmanifest" importance="low">'
    ])
    const meta = await metascraper({ url, html })
    snapshot(meta)
  })
  it('segment.com', async () => {
    const metascraper = createMetascraper([createMetascraperManifest()])
    const url = 'https://segment.com/blog/scaling-nsq/'
    const html = createHtml([
      '<link rel="manifest" href="/blog/manifest.webmanifest">'
    ])
    const meta = await metascraper({ url, html })
    snapshot(meta)
  })
})
