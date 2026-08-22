'use strict'

const test = require('ava').default

const { identifierDate, documentYear } = require('../src/date')
const { getDescription } = require('../src/description')
const { getTitle, isByline } = require('../src/title')
const { isBannerLine, isPersonName, splitNamePairs } = require('../src/text')
const {
  publisherFromLine,
  publisherFromUrl,
  isVenue
} = require('../src/publisher')
const { readEmbedded } = require('../src/embedded')
const { toAuthor } = require('../src/author')
const { getLang } = require('../src/lang')
const { getMedia } = require('../src/media')

const line = (index, size, text) => ({
  index,
  pageIndex: index,
  size,
  text,
  y: 700 - index * 12
})

test('a heading, a company and a place are not authors', t => {
  t.true(isPersonName('Yoshua Bengio'))
  t.true(isPersonName('Rosanna A Alegado'))
  t.true(isPersonName('Carvajal-Portuguez, Zayra Elisa'))
  t.false(isPersonName('RANDOM FORESTS'))
  t.false(isPersonName('Google AI Language'))
  t.false(isPersonName('Cookeville, U.S'))
  t.false(isPersonName('Costa Rica'))
  t.false(isPersonName('A Few Useful Things to Know'))
})

test('publishers print banners above the title', t => {
  t.true(isBannerLine('NBER WORKING PAPER SERIES'))
  t.true(isBannerLine('Working Paper 31161'))
  t.true(isBannerLine('arXiv:cs/0102004v1 [cs.CG] 6 Feb 2001'))
  t.true(isBannerLine('REVIEW'))
  t.false(isBannerLine('Deep learning'))
})

test('a title wraps, a byline repeats', t => {
  const wrapped = [
    line(0, 17, 'AN IMAGE IS WORTH 16X16 WORDS:'),
    line(1, 17, 'TRANSFORMERS FOR IMAGE RECOGNITION AT SCALE'),
    line(2, 10, 'Alexey Dosovitskiy')
  ]
  t.is(
    getTitle(wrapped).text,
    'AN IMAGE IS WORTH 16X16 WORDS: TRANSFORMERS FOR IMAGE RECOGNITION AT SCALE'
  )

  const cover = [
    line(0, 12, 'NBER WORKING PAPER SERIES'),
    line(1, 12, 'GENERATIVE AI AT WORK'),
    line(2, 12, 'Erik Brynjolfsson'),
    line(3, 12, 'Danielle Li')
  ]
  t.is(getTitle(cover).text, 'GENERATIVE AI AT WORK')
  t.true(isByline(cover[2], cover))
  t.false(isByline(cover[1], cover))
})

test('a byline survives emails, superscripts and editors', t => {
  t.is(
    toAuthor([line(0, 10, 'Nitish Srivastava nitish@cs.toronto.edu')], [0]),
    'Nitish Srivastava'
  )
  t.is(
    toAuthor(
      [line(0, 10, 'Loredana Bellantuono1,2, Flaviana Palmisano3')],
      [0]
    ),
    'Loredana Bellantuono, Flaviana Palmisano'
  )
  t.is(toAuthor([line(0, 10, 'Editor: Yoshua Bengio')], [0]), null)
  t.deepEqual(splitNamePairs('Jacob Devlin Ming-Wei Chang Kenton Lee'), [
    'Jacob Devlin',
    'Ming-Wei Chang',
    'Kenton Lee'
  ])
  t.deepEqual(splitNamePairs('Deep Residual Learning'), [])
})

test('a venue is read out of the running header', t => {
  t.is(
    publisherFromLine(
      'Scientific Reports | (2023) 13:1234 | https://doi.org/10.1038/x'
    ),
    'Scientific Reports'
  )
  t.is(
    publisherFromLine('4 3 6 | N A T U R E | V O L 5 2 1 | 2 8 M A Y 2 0 1 5'),
    'NATURE'
  )
  t.is(publisherFromUrl('https://cdn.openai.com/papers/gpt-4.pdf'), 'Openai')
  t.is(publisherFromUrl('https://arxiv.org/pdf/1706.03762v7'), 'arXiv')
  t.is(publisherFromUrl('https://www.nber.org/papers/w31161.pdf'), 'NBER')
  t.true(
    isVenue('Frontiers in Psychology', 'https://www.frontiersin.org/x/pdf')
  )
  t.false(isVenue('official NBER publications', 'https://www.nber.org/x.pdf'))
})

test('the identifier dates the document', t => {
  t.is(
    identifierDate('https://arxiv.org/pdf/1706.03762v7'),
    '2017-06-01T00:00:00.000Z'
  )
  t.is(
    identifierDate('https://arxiv.org/pdf/cs/0102004v1'),
    '2001-02-01T00:00:00.000Z'
  )
  t.is(
    identifierDate('https://proceedings.neurips.cc/paper/2012/file/x.pdf'),
    '2012-01-01T00:00:00.000Z'
  )
  t.is(identifierDate('https://bitcoin.org/bitcoin.pdf'), null)
  t.is(
    documentYear(
      [line(0, 10, 'Published as a conference paper at ICLR 2021')],
      { now: new Date('2026-01-01') }
    ),
    2021
  )
})

test('the description is the abstract, never the running header', t => {
  const lines = [
    line(0, 9, 'Frontiers in Psychology | Volume 10 | Article 1'),
    line(1, 14, 'Institutional Violence'),
    line(2, 10, 'Abstract'),
    line(
      3,
      10,
      'This work analyses the psychological consequences of institutional violence in family law courts.'
    )
  ]

  t.true(getDescription(lines).startsWith('This work analyses'))
})

test('generator noise never reaches a property', t => {
  const embedded = readEmbedded({
    info: {
      Title: 'Microsoft Word - final draft.docx',
      Author: 'Windows User',
      Subject: '2017 IEEE International Conference on Computer Vision',
      Creator: 'Acrobat'
    }
  })

  t.is(embedded.title, null)
  t.is(embedded.author, null)
  t.is(embedded.description, null)
})

test('a journal name plus a doi is not a description', t => {
  const embedded = readEmbedded({
    info: {
      Subject: 'Genome Biology, 2020, doi:10.1186/s13059-020-02007-1'
    }
  })
  t.is(embedded.description, null)
})

test('lang comes from the host or the words on the page', t => {
  t.is(
    getLang(
      'We study the staggered introduction of a generative AI assistant',
      {
        url: 'https://example.com/paper.pdf'
      }
    ),
    'en'
  )
  t.is(
    getLang(
      'Enseñanza del inglés en secundaria para los estudiantes de la escuela',
      {
        url: 'https://www.redalyc.org/pdf/x.pdf'
      }
    ),
    'es'
  )
})

test('a small square image is the logo; otherwise the host favicon', t => {
  const pixels = Buffer.alloc(16 * 16 * 3, 80)
  const { image, logo } = getMedia(
    [{ width: 16, height: 16, channels: 3, data: pixels }],
    { url: 'https://journals.plos.org/article.pdf' }
  )
  t.true(image.startsWith('data:image/png;base64,'))
  t.true(logo.startsWith('data:image/png;base64,'))

  const fallback = getMedia([], { url: 'https://arxiv.org/pdf/x' })
  t.is(fallback.image, null)
  t.is(
    fallback.logo,
    'https://www.google.com/s2/favicons?domain_url=https://arxiv.org/pdf/x&sz=128'
  )
})
