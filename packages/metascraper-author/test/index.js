'use strict'

const test = require('ava').default

const metascraper = require('metascraper')([
  require('..')(),
  require('metascraper-readability')()
])

const metascraperAuthor = require('metascraper')([require('..')()])

test('twitter:creator is used when no other author markup exists', async t => {
  const metadata = await metascraper({
    html: `
      <meta name="twitter:creator" content="@mayoclinic">
      <meta name="twitter:site" content="@mayoclinic">
      <div class="print"><a href="?p=1">Print</a></div>
      <div class="thin-content-by">By Mayo Clinic Staff</div>
    `,
    url: 'https://www.mayoclinic.org/diseases-conditions/depression/symptoms-causes/syc-20356007'
  })
  t.is(metadata.author, 'mayoclinic')
})

test('meta author wins over twitter:creator', async t => {
  const metadata = await metascraper({
    html: `
      <meta name="author" content="Nina Totenberg">
      <meta name="twitter:creator" content="@npr">
    `,
    url: 'https://www.npr.org/2022/06/24/example'
  })
  t.is(metadata.author, 'Nina Totenberg')
})

test('single-word matches from strict rules are rejected', async t => {
  const metadata = await metascraperAuthor({
    html: '<span class="author">Newsvilla</span>',
    url: 'https://example.com/'
  })
  t.is(metadata.author, null)
})

test('multi-word matches from strict rules are kept', async t => {
  const metadata = await metascraperAuthor({
    html: '<span class="author">Jane Doe</span>',
    url: 'https://example.com/'
  })
  t.is(metadata.author, 'Jane Doe')
})

test('a non-matching strict rule falls through to the next rule', async t => {
  const metadata = await metascraperAuthor({
    html: `
      <a href="/author/banksy">Banksy</a>
      <meta name="twitter:creator" content="@banksy">
    `,
    url: 'https://example.com/'
  })
  t.is(metadata.author, 'banksy')
})
