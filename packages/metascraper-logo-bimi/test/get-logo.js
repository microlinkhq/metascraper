'use strict'

const test = require('ava').default

const { createGetLogo } = require('..')

const {
  LOGO_URL,
  RECORD,
  acceptLogoUrl,
  bimi,
  createResolveTxt,
  dnsError
} = require('./helpers')

const createGetLogoFrom = (resolveTxt, options) =>
  createGetLogo({ resolveLogoUrl: acceptLogoUrl, resolveTxt, ...options })

test('resolve the logo published in the BIMI record', async t => {
  const getLogo = createGetLogoFrom(
    createResolveTxt(bimi('microlink.io', RECORD))
  )

  t.is(await getLogo('microlink.io'), LOGO_URL)
})

test('join TXT strings split into multiple chunks', async t => {
  const getLogo = createGetLogoFrom(
    createResolveTxt(
      bimi('microlink.io', RECORD.slice(0, 20), RECORD.slice(20))
    )
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

test('return undefined when the DNS lookup fails', async t => {
  const getLogo = createGetLogoFrom(createResolveTxt({}))

  t.is(await getLogo('example.com'), undefined)
})

test('return undefined when the logo cannot be resolved', async t => {
  const getLogo = createGetLogoFrom(
    createResolveTxt(bimi('microlink.io', RECORD)),
    { resolveLogoUrl: async () => undefined }
  )

  t.is(await getLogo('microlink.io'), undefined)
})

test('query the selector provided', async t => {
  const getLogo = createGetLogoFrom(
    createResolveTxt({ 'brand._bimi.microlink.io': [[RECORD]] }),
    { selector: 'brand' }
  )

  t.is(await getLogo('microlink.io'), LOGO_URL)
})

test('resolve the DNS record once per domain', async t => {
  const resolveTxt = createResolveTxt(bimi('microlink.io', RECORD))

  let calls = 0
  const getLogo = createGetLogoFrom(hostname => {
    calls++
    return resolveTxt(hostname)
  })

  t.is(await getLogo('microlink.io'), LOGO_URL)
  t.is(await getLogo('microlink.io'), LOGO_URL)
  t.is(calls, 1)
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

test('cache the absence of a record', async t => {
  let calls = 0
  const getLogo = createGetLogoFrom(async () => {
    calls++
    throw dnsError('ENODATA')
  })

  t.is(await getLogo('example.com'), undefined)
  t.is(await getLogo('example.com'), undefined)
  t.is(calls, 1)
})
