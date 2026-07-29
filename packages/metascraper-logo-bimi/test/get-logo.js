'use strict'

const test = require('ava').default

const {
  LOGO_URL,
  RECORD,
  countCalls,
  createGetLogoFrom,
  createResolveTxt,
  dnsError
} = require('./helpers')

test('resolve the logo published in the BIMI record', async t => {
  const getLogo = createGetLogoFrom(
    createResolveTxt({ 'default._bimi.microlink.io': [[RECORD]] })
  )

  t.is(await getLogo('microlink.io'), LOGO_URL)
})

test('join TXT strings split into multiple chunks', async t => {
  const getLogo = createGetLogoFrom(
    createResolveTxt({
      'default._bimi.microlink.io': [[RECORD.slice(0, 20), RECORD.slice(20)]]
    })
  )

  t.is(await getLogo('microlink.io'), LOGO_URL)
})

test('skip TXT records of other protocols sharing the hostname', async t => {
  const getLogo = createGetLogoFrom(
    createResolveTxt({
      'default._bimi.microlink.io': [
        ['v=spf1 include:_spf.google.com ~all'],
        [RECORD]
      ]
    })
  )

  t.is(await getLogo('microlink.io'), LOGO_URL)
})

test('return undefined when a second BIMI record is published', async t => {
  const getLogo = createGetLogoFrom(
    createResolveTxt({ 'default._bimi.microlink.io': [[RECORD], [RECORD]] })
  )

  t.is(await getLogo('microlink.io'), undefined)
})

test('honor a declination published next to another BIMI record', async t => {
  const getLogo = createGetLogoFrom(
    createResolveTxt({
      'default._bimi.microlink.io': [['v=BIMI1; l=; a=;'], [RECORD]]
    })
  )

  t.is(await getLogo('microlink.io'), undefined)
})

test('return undefined when the logo cannot be resolved', async t => {
  const getLogo = createGetLogoFrom(
    createResolveTxt({ 'default._bimi.microlink.io': [[RECORD]] }),
    { resolveLogoUrl: async () => undefined }
  )

  t.is(await getLogo('microlink.io'), undefined)
})

test('pass the logo location and the got options to resolveLogoUrl', async t => {
  const gotOpts = { timeout: 1000 }
  const seen = []

  const resolveLogoUrl = async (...args) => {
    seen.push(args)
    return LOGO_URL
  }

  const getLogo = createGetLogoFrom(
    createResolveTxt({ 'default._bimi.microlink.io': [[RECORD]] }),
    { gotOpts, resolveLogoUrl }
  )

  t.is(await getLogo('microlink.io'), LOGO_URL)
  t.deepEqual(seen, [[LOGO_URL, gotOpts]])
})

test('query the selector provided', async t => {
  const getLogo = createGetLogoFrom(
    createResolveTxt({ 'brand._bimi.microlink.io': [[RECORD]] }),
    { selector: 'brand' }
  )

  t.is(await getLogo('microlink.io'), LOGO_URL)
})

test('resolve the DNS record once per domain', async t => {
  const resolveTxt = countCalls(
    createResolveTxt({ 'default._bimi.microlink.io': [[RECORD]] })
  )
  const getLogo = createGetLogoFrom(resolveTxt)

  t.is(await getLogo('microlink.io'), LOGO_URL)
  t.is(await getLogo('microlink.io'), LOGO_URL)
  t.is(resolveTxt.calls, 1)
})

test('cache the absence of a record', async t => {
  const resolveTxt = countCalls(createResolveTxt({}))
  const getLogo = createGetLogoFrom(resolveTxt)

  t.is(await getLogo('example.com'), undefined)
  t.is(await getLogo('example.com'), undefined)
  t.is(resolveTxt.calls, 1)
})

test('do not cache a resolver failure', async t => {
  const resolveTxt = countCalls(async () => {
    throw dnsError('ESERVFAIL')
  })
  const getLogo = createGetLogoFrom(resolveTxt)

  t.is(await getLogo('example.com'), undefined)
  t.is(await getLogo('example.com'), undefined)
  t.is(resolveTxt.calls, 2)
})

test('scope the cache to the selector', async t => {
  const resolveTxt = createResolveTxt({
    'brand._bimi.microlink.io': [[RECORD]]
  })
  const store = new Map()

  const getDefaultLogo = createGetLogoFrom(resolveTxt, { keyvOpts: { store } })
  const getBrandLogo = createGetLogoFrom(resolveTxt, {
    keyvOpts: { store },
    selector: 'brand'
  })

  t.is(await getDefaultLogo('microlink.io'), undefined)
  t.is(await getBrandLogo('microlink.io'), LOGO_URL)
})
