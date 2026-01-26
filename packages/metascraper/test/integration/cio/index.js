'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const metascraper = require('../../..')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-audio')(),
  require('metascraper-video')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-manifest')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')(),
  require('metascraper-readability')()
])

const url =
  'https://www.cio.com/article/4049199/the-partnership-enabling-pegasystems-to-maximize-open-source-potential.html'

test('cio', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const { logo, ...metadata } = await metascraper({ html, url })

  t.true(
    [
      'https://www.cio.com/wp-content/themes/cio-b2b-child-theme/src/static/img/favicon.ico',
      'https://www.cio.com/wp-content/uploads/2023/02/cropped-CIO-favicon-2023.png?w=192',
      'https://www.cio.com/wp-content/uploads/2023/02/cropped-CIO-favicon-2023.png?w=32'
    ].includes(logo),
    `Logo is not in the list: ${logo}`
  )

  t.snapshot(metadata)
})
