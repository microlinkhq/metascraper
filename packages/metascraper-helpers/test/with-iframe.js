'use strict'

const cheerio = require('cheerio')
const test = require('ava').default

const { findRule, withIframe } = require('..')

const url = 'https://example.com'

const scrape = (html, rules) =>
  findRule(rules, { htmlDom: cheerio.load(html), url }, 'video')

const contentRule = ({ htmlDom: $ }) =>
  $('meta[property="og:video"]').attr('content')

test('page rules win before any iframe is fetched', async t => {
  const rules = withIframe(
    [contentRule],
    () => t.fail('getIframe should not be called'),
    'video'
  )

  t.is(
    await scrape('<meta property="og:video" content="/page.mp4">', rules),
    '/page.mp4'
  )
})

test('probes every iframe until one yields a value', async t => {
  const probed = []
  const rules = withIframe(
    [contentRule],
    async (_url, _$, src) => {
      probed.push(src)
      return cheerio.load(
        src.endsWith('/second')
          ? '<meta property="og:video" content="/found.mp4">'
          : ''
      )
    },
    'video'
  )

  t.is(
    await scrape(
      '<iframe src="/first"></iframe><iframe src="/second"></iframe>',
      rules
    ),
    '/found.mp4'
  )
  t.deepEqual(probed, [`${url}/first`, `${url}/second`])
})

test('a duplicated iframe src is probed once', async t => {
  const probed = []
  const rules = withIframe(
    [contentRule],
    async (_url, _$, src) => {
      probed.push(src)
      return cheerio.load('')
    },
    'video'
  )

  t.is(
    await scrape(
      `<iframe src="/dup"></iframe><iframe src="${url}/dup"></iframe>`,
      rules
    ),
    undefined
  )
  t.deepEqual(probed, [`${url}/dup`])
})

test('a throwing getIframe skips that src', async t => {
  const rules = withIframe(
    [contentRule],
    async (_url, _$, src) => {
      if (src.endsWith('/boom')) throw new Error('boom')
      return cheerio.load('<meta property="og:video" content="/found.mp4">')
    },
    'video'
  )

  t.is(
    await scrape(
      '<iframe src="/boom"></iframe><iframe src="/ok"></iframe>',
      rules
    ),
    '/found.mp4'
  )
})

test('falls back to twitter:player when no iframe yields a value', async t => {
  const probed = []
  const rules = withIframe(
    [contentRule],
    async (_url, _$, src) => {
      probed.push(src)
      return cheerio.load(
        src.endsWith('/player')
          ? '<meta property="og:video" content="/found.mp4">'
          : ''
      )
    },
    'video'
  )

  t.is(
    await scrape(
      '<iframe src="/empty"></iframe><meta name="twitter:player" content="/player">',
      rules
    ),
    '/found.mp4'
  )
  t.deepEqual(probed, [`${url}/empty`, '/player'])
})

test('no iframe and no twitter:player yields nothing', async t => {
  const rules = withIframe(
    [contentRule],
    () => t.fail('getIframe should not be called'),
    'video'
  )

  t.is(await scrape('<p>nothing here</p>', rules), undefined)
})

test('validate on a nested rule rejects the candidate behind the iframe', async t => {
  const validate = value => !value.endsWith('/hostile.mp4')
  const rule = Object.assign(contentRule, { validate })

  const rules = withIframe(
    [rule],
    async (_url, _$, src) =>
      cheerio.load(
        `<meta property="og:video" content="${
          src.endsWith('/hostile') ? '/hostile.mp4' : '/safe.mp4'
        }">`
      ),
    'video'
  )

  t.is(
    await scrape(
      '<iframe src="/hostile"></iframe><iframe src="/safe"></iframe>',
      rules
    ),
    '/safe.mp4'
  )
})
