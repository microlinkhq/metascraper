'use strict'

const test = require('ava')

const createMetascraper = (...args) =>
  require('metascraper')([require('..')(...args)])

const createHtml = meta =>
  `<!DOCTYPE html>
<html lang="en">
<head>${meta.join('/n')}</head>
<body></body>
</html>`.trim()

test('provide `keyvOpts`', async t => {
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

  t.truthy(cache.get(`${url}/`))
  t.truthy(metadataOne.logo)
  t.is(cache.size, 1)

  const metadataTwo = await metascraper({
    url: 'https://lolwerhere.com',
    html: createHtml(['<link rel="manifest" href="/" importance="low">'])
  })

  t.falsy(metadataTwo.logo)
  t.is(cache.size, 2)
})

test('does nothing if manifest URL is not reachable', async t => {
  const metascraper = createMetascraper()
  const url = 'https://www.linkedin.com/company/audiense/'
  const html = createHtml([
    '<link rel="manifest" href="https://static-exp1.licdn.com/sc/h/8ekldmhv4d8prk5sml735t6np">'
  ])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('does nothing if icons field at manifest is not present', async t => {
  const metascraper = createMetascraper()
  const url = 'https://www.linkedin.com/company/audiense/'
  const html = createHtml([
    '<link rel="manifest" href="https://test-webmanifest.vercel.app?icons=false&name=Lumeris&short_name=Lumeris">'
  ])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('vercel.com', async t => {
  const metascraper = createMetascraper()
  const url = 'https://vercel.com'
  const html = createHtml([
    '<link rel="manifest" href="/site.webmanifest" importance="low">'
  ])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('segment.com', async t => {
  const metascraper = createMetascraper()
  const url = 'https://segment.com/blog/scaling-nsq/'
  const html = createHtml([
    '<link rel="manifest" href="/blog/manifest.webmanifest">'
  ])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('youtube.com', async t => {
  const metascraper = createMetascraper()
  const url = 'https://www.youtube.com/feed/explore'
  const html = createHtml([
    '<link rel="manifest" href="/manifest.webmanifest" crossorigin="use-credentials">'
  ])
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('twitter.com', async t => {
  const metascraper = createMetascraper()
  const url = 'https://twitter.com/explore'
  const html = createHtml([
    '<link rel="manifest" href="/manifest.json" crossorigin="use-credentials">'
  ])
  const { logo, ...metadata } = await metascraper({ url, html })

  t.true(logo.startsWith('http'))
  t.snapshot(metadata)
})
