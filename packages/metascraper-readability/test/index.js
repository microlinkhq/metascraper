'use strict'

const test = require('ava')
const path = require('path')
const fs = require('fs')
const { load } = require('cheerio')

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

test('serializes html once per invocation', async t => {
  const url = 'https://microlink.io'
  const html = fs.readFileSync(
    path.resolve(__dirname, 'fixtures/microlink.io.html'),
    'utf-8'
  )

  const $ = load(html, { baseURI: url })
  const originalHtml = $.html.bind($)
  let htmlCalls = 0

  $.html = (...args) => {
    if (args.length === 0) htmlCalls++
    return originalHtml(...args)
  }

  await metascraper({ htmlDom: $, url })
  t.is(htmlCalls, 1)
})

test('extracts lang from <html lang> attribute', async t => {
  const url = 'https://example.com'
  const html = `<!DOCTYPE html>
<html lang="en">
<head><title>Test</title></head>
<body><p>Content</p></body>
</html>`

  const metadata = await metascraper({ html, url })
  t.is(metadata.lang, 'en')
})
