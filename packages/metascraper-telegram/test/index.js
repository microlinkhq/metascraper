'use strict'

const { readFile } = require('fs').promises
const { resolve } = require('path')
const test = require('ava')

const metascraper = require('metascraper')([
  require('metascraper-telegram')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

test('avoid non allowed URLs', async t => {
  const url = 'https://t.co/d0rwf2dLIp'
  const metadata = await metascraper({ url })
  t.is(metadata.audio, undefined)
})

test('avoid URLs with no iframe', async t => {
  const url = 'https://t.me/unlimitedhangout'
  const metadata = await metascraper({ url })
  t.is(metadata.audio, undefined)
})

test('post with little image', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-right-preview.html')
  )
  const url = 'https://t.me/teslahunt/2351'
  const { image, ...metadata } = await metascraper({ html, url })
  t.true(image.startsWith('https://cdn4'))
  t.snapshot(metadata)
})

test('post with big image', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-full-image.html')
  )
  const url = 'https://t.me/chollometro/28542'
  const { image, ...metadata } = await metascraper({ html, url })
  t.true(image.startsWith('https://cdn4'))
  t.snapshot(metadata)
})

test('post with an image inside a link', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-link-image.html')
  )
  const url = 'https://t.me/teslahunt/15513'
  const { image, ...metadata } = await metascraper({ html, url })
  t.true(image.startsWith('https://cdn4'))
  t.snapshot(metadata)
})
