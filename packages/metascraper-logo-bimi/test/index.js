'use strict'

const test = require('ava').default

const metascraperLogoBimi = require('..')

const {
  LOGO_URL,
  RECORD,
  acceptLogoUrl,
  createResolveTxt
} = require('./helpers')

const createMetascraper = resolveTxt =>
  require('metascraper')([
    metascraperLogoBimi({ resolveTxt, resolveLogoUrl: acceptLogoUrl }),
    require('metascraper-logo')()
  ])

const BIMI_RECORDS = { 'default._bimi.microlink.io': [[RECORD]] }

test('get the logo of the registrable domain', async t => {
  const metascraper = createMetascraper(createResolveTxt(BIMI_RECORDS))

  const { logo } = await metascraper({
    url: 'https://cdn.microlink.io/docs/getting-started',
    html: '<html><head></head><body></body></html>'
  })

  t.is(logo, LOGO_URL)
})

test('take precedence over the HTML markup', async t => {
  const metascraper = createMetascraper(createResolveTxt(BIMI_RECORDS))

  const { logo } = await metascraper({
    url: 'https://microlink.io',
    html: '<html><head><meta property="og:logo" content="https://microlink.io/logo.png"></head></html>'
  })

  t.is(logo, LOGO_URL)
})

test('fall back to the next rule when there is no BIMI record', async t => {
  const metascraper = createMetascraper(createResolveTxt({}))

  const { logo } = await metascraper({
    url: 'https://example.com',
    html: '<html><head><meta property="og:logo" content="https://example.com/logo.png"></head></html>'
  })

  t.is(logo, 'https://example.com/logo.png')
})

test('return null when nothing resolves', async t => {
  const metascraper = createMetascraper(createResolveTxt({}))

  const { logo } = await metascraper({
    url: 'https://example.com',
    html: '<html><head></head><body></body></html>'
  })

  t.is(logo, null)
})
