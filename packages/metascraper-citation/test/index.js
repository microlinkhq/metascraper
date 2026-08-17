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
  t.true(
    hasCitation(
      load('<meta name="citation_doi" content="10.1371/journal.pone.0000001">')
    )
  )
})

test('test() is true when Dublin Core tags are present', t => {
  t.true(hasCitation(load('<meta name="dc.title" content="A paper">')))
  t.true(hasCitation(load('<meta name="DC.Title" content="A paper">')))
  t.true(hasCitation(load('<meta name="dcterms.title" content="A paper">')))
  t.true(
    hasCitation(
      load('<meta name="dc.identifier" content="10.1101/2020.03.22.002386">')
    )
  )
})

test('test() is false when Highwire and Dublin Core tags are absent', t => {
  t.false(hasCitation(load('<title>Example</title>')))
  t.false(
    hasCitation(load('<meta name="DOI" content="10.1038/s41586-021-03819-2">'))
  )
  t.false(
    hasCitation(
      load('<meta name="prism.doi" content="doi:10.1038/s41586-021-03819-2">')
    )
  )
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

test('pmc.ncbi.nlm.nih.gov/articles/PMC3531190', async t => {
  const url = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3531190'
  t.snapshot(await metascraper({ html: await loadHtml(url), url }))
})

test('www.nature.com/articles/s41586-021-03819-2', async t => {
  const url = 'https://www.nature.com/articles/s41586-021-03819-2'
  t.snapshot(await metascraper({ html: await loadHtml(url), url }))
})

test('arxiv.org/abs/1706.03762', async t => {
  const url = 'https://arxiv.org/abs/1706.03762'
  t.snapshot(await metascraper({ html: await loadHtml(url), url }))
})

test('www.biorxiv.org/content/10.1101/2020.03.22.002386v3', async t => {
  const url = 'https://www.biorxiv.org/content/10.1101/2020.03.22.002386v3'
  t.snapshot(await metascraper({ html: await loadHtml(url), url }))
})

test('www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.00781/full', async t => {
  const url =
    'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.00781/full'
  t.snapshot(await metascraper({ html: await loadHtml(url), url }))
})

test('Dublin Core tags are used when citation tags are absent', async t => {
  const metadata = await metascraper({
    html: `
      <meta name="DC.Title" content="A SARS-CoV-2-Human Protein-Protein Interaction Map">
      <meta name="DC.Contributor" content="David E. Gordon">
      <meta name="DC.Date" content="2020-03-27">
      <meta name="DC.Publisher" content="Cold Spring Harbor Laboratory">
    `,
    url: 'https://example.com'
  })
  t.is(metadata.title, 'A SARS-CoV-2-Human Protein-Protein Interaction Map')
  t.is(metadata.author, 'David E. Gordon')
  t.is(metadata.date, '2020-03-27T00:00:00.000Z')
  t.is(metadata.publisher, 'Cold Spring Harbor Laboratory')
})

test('citation_date wins over citation_online_date', async t => {
  const metadata = await metascraper({
    html: `
      <meta name="citation_title" content="Attention Is All You Need">
      <meta name="citation_date" content="2017/06/12">
      <meta name="citation_online_date" content="2023/08/02">
    `,
    url: 'https://arxiv.org/abs/1706.03762'
  })
  t.is(metadata.date, '2017-06-12T12:00:00.000Z')
})

test('citation tags win over Dublin Core', async t => {
  const metadata = await metascraper({
    html: `
      <meta name="citation_title" content="Highwire title">
      <meta name="dc.title" content="Dublin Core title">
      <meta name="citation_author" content="Jane Doe">
      <meta name="dc.creator" content="John Smith">
    `,
    url: 'https://example.com'
  })
  t.is(metadata.title, 'Highwire title')
  t.is(metadata.author, 'Jane Doe')
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

test('given-name/surname HTML is used when citation_author is absent', async t => {
  const metadata = await metascraper({
    html: `
      <meta name="citation_title" content="A paper">
      <span class="given-name">Sarah Maria</span>
      <span class="surname">Vargas</span>
      <span class="given-name">Ana Carolina</span>
      <span class="surname">Barcelos</span>
      <div class="content-authors">
        <a class="anchor">Get rights and content</a>
      </div>
    `,
    url: 'https://www.sciencedirect.com/science/article/abs/pii/S2352485522001888'
  })
  t.is(metadata.author, 'Sarah Maria Vargas, Ana Carolina Barcelos')
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
