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
  it('does nothing if manifest URL is not reachable', async () => {
    const metascraper = createMetascraper([createMetascraperManifest()])
    const url = 'https://www.linkedin.com/company/audiense/'
    const html = createHtml([
      '<link rel="manifest" href="https://static-exp1.licdn.com/sc/h/8ekldmhv4d8prk5sml735t6np">'
    ])
    const meta = await metascraper({ url, html })
    snapshot(meta)
  })
  it('does nothing if icons field at manifest is not present', async () => {
    const metascraper = createMetascraper([createMetascraperManifest()])
    const url = 'https://www.linkedin.com/company/audiense/'
    const html = createHtml([
      '<link rel="manifest" href="https://test-webmanifest.vercel.app?icons=false&name=Lumeris&short_name=Lumeris">'
    ])
    const meta = await metascraper({ url, html })
    snapshot(meta)
  })
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
