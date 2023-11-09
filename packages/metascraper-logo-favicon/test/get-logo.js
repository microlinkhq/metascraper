'use strict'

const test = require('ava')

const { createGetLogo } = require('..')

test('serialize null correctly', async t => {
  const cache = new Map()
  const keyvOpts = { store: cache }
  const getLogo = createGetLogo({
    keyvOpts,
    withGoogle: false,
    withFavicon: false
  })
  t.is(await getLogo('https://example.com'), undefined)
  t.is(JSON.parse(cache.get('https://example.com')).value, null)
})
