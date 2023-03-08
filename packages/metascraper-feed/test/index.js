'use strict'

const test = require('ava')

const createMetascraperFeed = require('..')
const createMetascraper = require('metascraper')

test('application/rss+xml', async t => {
  const url = 'https://example.com'
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<link rel="alternate" type="application/rss+xml" href="https://zander.wtf/rss.xml" title="Zander's RSS Feed" />
</head>
<body></body>
</html>`

  const metascraper = createMetascraper([createMetascraperFeed()])
  const metadata = await metascraper({ url, html })
  t.true(metadata.feed.includes('https://zander.wtf/rss.xml'))
})

test('application/feed+json', async t => {
  const url = 'https://example.com'
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<link rel="alternate" type="application/feed+json" href="https://zander.wtf/feed.json" title="Zander's JSON Feed" />
</head>
<body></body>
</html>`

  const metascraper = createMetascraper([createMetascraperFeed()])
  const metadata = await metascraper({ url, html })
  t.true(metadata.feed.includes('https://zander.wtf/feed.json'))
})

test('application/atom+xml', async t => {
  const url = 'https://example.com'
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<link rel="alternate" type="application/atom+xml" href="https://zander.wtf/atom.xml" title="Zander's ATOM Feed" />
</head>
<body></body>
</html>`

  const metascraper = createMetascraper([createMetascraperFeed()])
  const metadata = await metascraper({ url, html })
  t.true(metadata.feed.includes('https://zander.wtf/atom.xml'))
})
