'use strict'

const test = require('ava')

const createMetascraper = (...args) =>
  require('metascraper')([require('..')(...args)])

test('provide `keyvOpts`', async t => {
  const cache = new Map()
  const metascraper = createMetascraper({ keyvOpts: { store: cache } })

  const metadataOne = await metascraper({ url: 'https://microlink.io' })
  t.truthy(metadataOne.logo)
  t.truthy(metadataOne.publisher)
  t.is(cache.size, 1)

  const metadataTwo = await metascraper({ url: 'https://lolwerhere.com' })
  t.falsy(metadataTwo.logo)
  t.falsy(metadataTwo.publisher)
  t.is(cache.size, 2)
})

test('provide `logoOpts`', async t => {
  const metascraper = createMetascraper({
    gotOpts: {
      timeout: 5000
    },
    logoOpts: {
      format: 'jpg',
      greyscale: true
    }
  })
  const url = 'https://microlink.io'
  const metadata = await metascraper({ url })
  t.snapshot(metadata)
})

test('works fine with subdomains', async t => {
  const metascraper = createMetascraper()
  const url = 'https://www.youtube.com/watch?v=jcFZfcxs85o'
  const metadata = await metascraper({ url })
  t.snapshot(metadata)
})

test('returns logo url if it exists', async t => {
  const metascraper = createMetascraper()
  const url = 'https://microlink.io'
  const metadata = await metascraper({ url })
  t.snapshot(metadata)
})

test('returns null if no logo available', async t => {
  const metascraper = createMetascraper()
  const url = 'https://lolwerhere.com'
  const metadata = await metascraper({ url })
  t.snapshot(metadata)
})
