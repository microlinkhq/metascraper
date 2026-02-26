'use strict'

const test = require('ava')
const path = require('path')
const fs = require('fs')

const metascraper = require('metascraper')([
  require('metascraper-readability')()
])

test('learnnode.com', async t => {
  const url = 'https://learnnode.com'
  const html = fs.readFileSync(
    path.resolve(__dirname, 'fixtures/learnnode.com.html'),
    'utf-8'
  )

  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('microlink.io', async t => {
  const url = 'https://microlink.io'
  const html = fs.readFileSync(
    path.resolve(__dirname, 'fixtures/microlink.io.html'),
    'utf-8'
  )
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('does not reuse cached readability output for same url with different html', async t => {
  const url = 'https://example.com/article'
  const [learnnodeHtml, microlinkHtml] = await Promise.all([
    fs.promises.readFile(
      path.resolve(__dirname, 'fixtures/learnnode.com.html')
    ),
    fs.promises.readFile(path.resolve(__dirname, 'fixtures/microlink.io.html'))
  ])

  const learnnodeMetadata = await metascraper({ url, html: learnnodeHtml })
  const microlinkMetadataWithSameUrl = await metascraper({
    url,
    html: microlinkHtml
  })
  const microlinkMetadata = await metascraper({
    url: 'https://example.com/another-article',
    html: microlinkHtml
  })

  t.truthy(learnnodeMetadata.title)
  t.not(microlinkMetadataWithSameUrl.title, learnnodeMetadata.title)
  t.is(microlinkMetadataWithSameUrl.title, microlinkMetadata.title)
})

test('kikobeats.com', async t => {
  const url = 'https://kikobeats.com'
  const html = fs.readFileSync(
    path.resolve(__dirname, 'fixtures/kikobeats.com.html'),
    'utf-8'
  )
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('handle malformed HTML', async t => {
  const url =
    'https://tours.jamesphotographygroup.com/public/vtour/display/1754637'
  const html = fs.readFileSync(
    path.resolve(__dirname, 'fixtures/malformed.html'),
    'utf-8'
  )
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('chowhanandsons.com', async t => {
  const url = 'https://chowhanandsons.com'
  const html = fs.readFileSync(
    path.resolve(__dirname, 'fixtures/chowhanandsons.com.html'),
    'utf-8'
  )
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})
