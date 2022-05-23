'use strict'

const test = require('ava')

const createMetascraperDescription = require('..')
const createMetascraper = require('metascraper')

test('provide `truncateLength`', async t => {
  const url = 'https://example.com'
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="description" content="welcome to metascraper">
</head>
<body></body>
</html>`

  const metascraper = createMetascraper([
    createMetascraperDescription({ truncateLength: 1 })
  ])
  const metadata = await metascraper({ url, html })
  t.true(metadata.description.startsWith('w…'))
})
