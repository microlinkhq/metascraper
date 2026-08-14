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

const plosOneUrl =
  'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0000001'

const loadPlosOne = () =>
  readFile(resolve(__dirname, 'fixtures/plos-one.html'), 'utf8')

const sciencedirect = `
<meta property="og:title" content="Genetic monitoring of the critically endangered leatherback turtle (Dermochelys coriacea) in the South West Atlantic">
<title>Genetic monitoring of the critically endangered leatherback turtle (Dermochelys coriacea) in the South West Atlantic - ScienceDirect</title>
<meta name="citation_title" content="Genetic monitoring of the critically endangered leatherback turtle (Dermochelys coriacea) in the South West Atlantic">
<meta name="citation_doi" content="10.1016/j.rsma.2022.102530">
<meta name="citation_publisher" content="Elsevier">
<meta name="citation_journal_title" content="Regional Studies in Marine Science">
<meta name="citation_publication_date" content="2022/09/01">
<meta name="citation_online_date" content="2022/07/08">
`

test('test() is true when citation tags are present', async t => {
  t.true(hasCitation(load(sciencedirect)))
  t.true(hasCitation(load(await loadPlosOne())))
})

test('test() is false when citation tags are absent', t => {
  t.false(hasCitation(load('<title>Example</title>')))
})

test('citation_title wins over og:title and title', async t => {
  const metadata = await metascraper({
    html: sciencedirect,
    url: 'https://www.sciencedirect.com/science/article/abs/pii/S2352485522001888'
  })
  t.is(
    metadata.title,
    'Genetic monitoring of the critically endangered leatherback turtle (Dermochelys coriacea) in the South West Atlantic'
  )
})

test('plos one fixture', async t => {
  const html = await loadPlosOne()
  const metadata = await metascraper({ html, url: plosOneUrl })
  t.is(
    metadata.title,
    'Neural Substrate of Cold-Seeking Behavior in Endotoxin Shock'
  )
  t.is(metadata.author, 'Maria C Almeida')
  t.is(metadata.publisher, 'Public Library of Science')
  t.is(metadata.date, '2006-12-20T12:00:00.000Z')
})

test('no citation_author falls through to meta[name=author]', async t => {
  const html = `
    ${sciencedirect}
    <meta name="author" content="Jane Doe">
  `
  const metadata = await metascraper({
    html,
    url: 'https://www.sciencedirect.com/science/article/abs/pii/S2352485522001888'
  })
  t.is(metadata.author, 'Jane Doe')
})

test('citation_publication_date is parsed', async t => {
  const metadata = await metascraper({
    html: sciencedirect,
    url: 'https://www.sciencedirect.com/science/article/abs/pii/S2352485522001888'
  })
  t.is(metadata.date, '2022-09-01T12:00:00.000Z')
})

test('citation_publisher wins over citation_journal_title', async t => {
  const metadata = await metascraper({
    html: sciencedirect,
    url: 'https://www.sciencedirect.com/science/article/abs/pii/S2352485522001888'
  })
  t.is(metadata.publisher, 'Elsevier')
})

test('citation_journal_title is used when publisher is absent', async t => {
  const html = `
    <meta name="citation_title" content="A paper">
    <meta name="citation_journal_title" content="Regional Studies in Marine Science">
  `
  const metadata = await metascraper({
    html,
    url: 'https://www.sciencedirect.com/science/article/abs/pii/S2352485522001888'
  })
  t.is(metadata.publisher, 'Regional Studies in Marine Science')
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
