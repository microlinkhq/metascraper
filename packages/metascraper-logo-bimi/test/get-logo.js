'use strict'

const test = require('ava').default

const { createGetLogo } = require('..')
const { createResolveTxt, dnsError } = require('./helpers')

const LOGO_URL = 'https://cdn.microlink.io/logo/logo.svg'

const resolveLogoUrl = async logoUrl => logoUrl

const bimi = (domain, record) => ({ [`default._bimi.${domain}`]: [[record]] })

test('resolve the logo published in the BIMI record', async t => {
  const getLogo = createGetLogo({
    resolveLogoUrl,
    resolveTxt: createResolveTxt(
      bimi('microlink.io', `v=BIMI1; l=${LOGO_URL};`)
    )
  })

  t.is(await getLogo('microlink.io'), LOGO_URL)
})

test('join TXT strings split into multiple chunks', async t => {
  const record = `v=BIMI1; l=${LOGO_URL};`
  const getLogo = createGetLogo({
    resolveLogoUrl,
    resolveTxt: createResolveTxt({
      'default._bimi.microlink.io': [[record.slice(0, 20), record.slice(20)]]
    })
  })

  t.is(await getLogo('microlink.io'), LOGO_URL)
})

test('skip TXT records of other protocols sharing the hostname', async t => {
  const getLogo = createGetLogo({
    resolveLogoUrl,
    resolveTxt: createResolveTxt({
      'default._bimi.microlink.io': [
        ['v=spf1 include:_spf.google.com ~all'],
        [`v=BIMI1; l=${LOGO_URL};`]
      ]
    })
  })

  t.is(await getLogo('microlink.io'), LOGO_URL)
})

test('return undefined when the domain has no BIMI record', async t => {
  const getLogo = createGetLogo({
    resolveLogoUrl,
    resolveTxt: createResolveTxt({})
  })

  t.is(await getLogo('example.com'), undefined)
})

test('return undefined when the DNS lookup fails', async t => {
  const getLogo = createGetLogo({
    resolveLogoUrl,
    resolveTxt: async () => {
      throw dnsError('ENOTFOUND')
    }
  })

  t.is(await getLogo('example.com'), undefined)
})

test('return undefined for a declination record', async t => {
  const getLogo = createGetLogo({
    resolveLogoUrl,
    resolveTxt: createResolveTxt(bimi('example.com', 'v=BIMI1; l=;'))
  })

  t.is(await getLogo('example.com'), undefined)
})

test('return undefined when the logo cannot be resolved', async t => {
  const getLogo = createGetLogo({
    resolveLogoUrl: async () => undefined,
    resolveTxt: createResolveTxt(
      bimi('microlink.io', `v=BIMI1; l=${LOGO_URL};`)
    )
  })

  t.is(await getLogo('microlink.io'), undefined)
})

test('query the selector provided', async t => {
  const getLogo = createGetLogo({
    resolveLogoUrl,
    selector: 'brand',
    resolveTxt: createResolveTxt({
      'brand._bimi.microlink.io': [[`v=BIMI1; l=${LOGO_URL};`]]
    })
  })

  t.is(await getLogo('microlink.io'), LOGO_URL)
})

test('resolve the DNS record once per domain', async t => {
  const records = bimi('microlink.io', `v=BIMI1; l=${LOGO_URL};`)
  const resolveTxt = createResolveTxt(records)

  let calls = 0
  const getLogo = createGetLogo({
    resolveLogoUrl,
    resolveTxt: hostname => {
      calls++
      return resolveTxt(hostname)
    }
  })

  t.is(await getLogo('microlink.io'), LOGO_URL)
  t.is(await getLogo('microlink.io'), LOGO_URL)
  t.is(calls, 1)
})

test('cache the absence of a record', async t => {
  let calls = 0
  const getLogo = createGetLogo({
    resolveLogoUrl,
    resolveTxt: async () => {
      calls++
      throw dnsError('ENODATA')
    }
  })

  t.is(await getLogo('example.com'), undefined)
  t.is(await getLogo('example.com'), undefined)
  t.is(calls, 1)
})
