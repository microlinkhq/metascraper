'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const { load } = require('cheerio')
const test = require('ava').default

const { test: hasCitation } = require('..')

const metascraper = require('metascraper')([
  require('..')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const slug = url => url.replace(/^https?:\/\//, '').replace(/[^\w.-]+/g, '-')

const loadHtml = url =>
  readFile(resolve(__dirname, 'fixtures', `${slug(url)}.html`), 'utf8')

test('test() is true when citation tags are present', t => {
  t.true(hasCitation(load('<meta name="citation_title" content="A paper">')))
})

test('test() is false when citation tags are absent', t => {
  t.false(hasCitation(load('<title>Example</title>')))
})

test('journals.plos.org/plosone/article?id=10.1371/journal.pone.0000001', async t => {
  const url =
    'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0000001'
  t.snapshot(await metascraper({ html: await loadHtml(url), url }))
})

test('www.sciencedirect.com/science/article/abs/pii/S2352485522001888', async t => {
  const url =
    'https://www.sciencedirect.com/science/article/abs/pii/S2352485522001888'
  t.snapshot(await metascraper({ html: await loadHtml(url), url }))
})

test('no citation_author falls through to meta[name=author]', async t => {
  const metadata = await metascraper({
    html: `
      <meta name="citation_title" content="A paper">
      <meta name="author" content="Jane Doe">
    `,
    url: 'https://example.com'
  })
  t.is(metadata.author, 'Jane Doe')
})

test('citation_journal_title is used when publisher is absent', async t => {
  const metadata = await metascraper({
    html: `
      <meta name="citation_title" content="A paper">
      <meta name="citation_journal_title" content="PLOS ONE">
    `,
    url: 'https://example.com'
  })
  t.is(metadata.publisher, 'PLOS ONE')
})

test('pages without citation tags use generic rules', async t => {
  const html = `
    <title>Example page - Site</title>
    <meta property="og:title" content="Example page">
    <meta name="author" content="Nina Totenberg">
  `
  const metadata = await metascraper({
    html,
    url: 'https://www.npr.org/2022/06/24/example'
  })
  t.is(metadata.title, 'Example page')
  t.is(metadata.author, 'Nina Totenberg')
})
