'use strict'

const test = require('ava').default

const { createPdf, runServer } = require('./helpers')

const { test: isPdfLink } = require('..')

const createMetascraper = (pdf, opts) =>
  require('metascraper')([require('..')({ getPdf: async () => pdf, ...opts })])

const PAPER = createPdf(
  [
    { text: 'Attention Is All You Need', size: 18 },
    { text: 'Ashish Vaswani  Noam Shazeer  Niki Parmar', size: 11 },
    { text: 'Google Brain', size: 11 },
    { text: 'avaswani@google.com', size: 9 },
    { text: 'Abstract', size: 11 },
    {
      text: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.',
      size: 9
    },
    {
      text: 'We propose the Transformer, based solely on attention mechanisms.',
      size: 9
    }
  ],
  { info: { Title: '', Author: '', Creator: 'LaTeX with hyperref' } }
)

const WORKING_PAPER = createPdf(
  [
    { text: 'NBER WORKING PAPER SERIES', size: 12 },
    { text: 'GENERATIVE AI AT WORK', size: 12 },
    { text: 'Erik Brynjolfsson', size: 12 },
    { text: 'Danielle Li', size: 12 },
    { text: 'Working Paper 31161', size: 12 },
    { text: 'Abstract', size: 10 },
    {
      text: 'We study the staggered introduction of a generative AI assistant among customer support agents.',
      size: 10
    }
  ],
  { info: { Title: 'printmgr file' } }
)

const JOURNAL = createPdf([
  { text: 'Frontiers in Psychology | Volume 10 | Article 1', size: 7 },
  {
    text: 'Institutional Violence Against Users of the Family Law Courts',
    size: 16
  },
  { text: 'Miguel Clemente, Dolores Padilla-Racero', size: 10 },
  { text: 'Abstract', size: 10 },
  {
    text: 'This work analyses the psychological consequences of institutional violence in family law courts.',
    size: 9
  }
])

test('test() only accepts a PDF url', t => {
  t.true(isPdfLink({ url: 'https://arxiv.org/pdf/1706.03762v7' }))
  t.true(isPdfLink({ url: 'https://example.com/paper.pdf' }))
  t.true(
    isPdfLink({
      url: 'https://journals.plos.org/plosone/article/file?id=10.1371/x&type=printable'
    })
  )
  t.true(
    isPdfLink({
      url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2019.00001/pdf'
    })
  )
  t.false(isPdfLink({ url: 'https://arxiv.org/abs/1706.03762' }))
  t.false(isPdfLink({ url: 'https://example.com' }))
  t.false(isPdfLink({}))
})

test('reads the metadata of a paper', async t => {
  const metascraper = createMetascraper(PAPER)
  const metadata = await metascraper({
    url: 'https://arxiv.org/pdf/1706.03762v7'
  })

  t.is(metadata.title, 'Attention Is All You Need')
  t.is(metadata.author, 'Ashish Vaswani')
  t.is(metadata.publisher, 'arXiv')
  t.is(metadata.date, '2017-06-01T00:00:00.000Z')
  t.is(metadata.lang, 'en')
  t.is(
    metadata.logo,
    `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(
      'https://arxiv.org/pdf/1706.03762v7'
    )}&sz=128`
  )
  t.true(
    metadata.description.startsWith('The dominant sequence transduction models')
  )
})

test('skips the banner a working paper prints above its title', async t => {
  const metascraper = createMetascraper(WORKING_PAPER)
  const metadata = await metascraper({
    url: 'https://www.nber.org/system/files/working_papers/w31161/w31161.pdf'
  })

  t.is(metadata.title, 'GENERATIVE AI AT WORK')
  t.is(metadata.author, 'Erik Brynjolfsson')
  t.is(metadata.publisher, 'NBER')
  t.is(metadata.lang, 'en')
})

test('reads the journal out of the running header', async t => {
  const metascraper = createMetascraper(JOURNAL)
  const metadata = await metascraper({
    url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2019.00001/pdf'
  })

  t.is(metadata.publisher, 'Frontiers in Psychology')
  t.is(metadata.author, 'Miguel Clemente')
  t.is(
    metadata.title,
    'Institutional Violence Against Users of the Family Law Courts'
  )
})

test('fetches the PDF from the url', async t => {
  const origin = await runServer(t, ({ res }) => {
    res.setHeader('content-type', 'application/pdf')
    res.end(PAPER)
  })
  const metascraper = require('metascraper')([require('..')()])
  const metadata = await metascraper({ url: new URL('paper.pdf', origin).href })
  t.is(metadata.title, 'Attention Is All You Need')
  t.is(metadata.author, 'Ashish Vaswani')
})

test('is a no-op without a PDF url', async t => {
  const metascraper = require('metascraper')([require('..')()])
  const metadata = await metascraper({
    url: 'https://example.com',
    html: '<html></html>'
  })

  t.deepEqual(metadata, {
    author: null,
    date: null,
    description: null,
    image: null,
    lang: null,
    logo: null,
    publisher: null,
    title: null
  })
})
