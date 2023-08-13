'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const createMetascraperIframe = require('..')

const { commonProviders } = require('./helpers')

const createMetascraper = (...args) =>
  require('metascraper')([createMetascraperIframe(...args)])

test('provide `gotOpts`', async t => {
  const cache = new Map()
  const html = await readFile(resolve(__dirname, 'fixtures/genially.html'))
  const url = 'https://view.genial.ly/5dc53cfa759d2a0f4c7db5f4'
  const metascraper = createMetascraper({ gotOpts: { cache } })

  const metadataOne = await metascraper({
    url,
    html,
    iframe: { maxWidth: 350 }
  })

  t.truthy(metadataOne.iframe)
  t.is(cache.size, 2)

  const metadataTwo = await metascraper({
    url,
    html,
    iframe: { maxWidth: 500 }
  })

  t.truthy(metadataTwo.iframe)
  t.is(cache.size, 4)
})

test('provide `iframe`', async t => {
  const url = 'https://vimeo.com/135373919'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, iframe: { maxWidth: 350 } })
  t.true(metadata.iframe.includes('width="350"'))
})

commonProviders.forEach(url => {
  test(url, async t => {
    const metascraper = createMetascraper([createMetascraperIframe()])
    const metadata = await metascraper({ url })
    t.truthy(metadata.iframe)
  })
})

test('get iframe from markup', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/genially.html'))
  const url = 'https://view.genial.ly/5dc53cfa759d2a0f4c7db5f4'
  const rules = [createMetascraperIframe()]
  const metascraper = createMetascraper(rules)
  const metadata = await metascraper({ url, html })
  t.truthy(metadata.iframe)
})
