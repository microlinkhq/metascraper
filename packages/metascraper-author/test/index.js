'use strict'

const test = require('ava').default

const metascraper = require('metascraper')([
  require('..')(),
  require('metascraper-readability')()
])

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
