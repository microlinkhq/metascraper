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
  'http://www.leandatainc.com/account-based-sales-marketing/the-winds-of-change'

test('lean-data', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))

  const { logo, ...metadata } = await metascraper({ html, url })

  t.true(
    [
      'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://www.leandatainc.com/account-based-sales-marketing/the-winds-of-change&size=128',
      'http://www.leandata.com/wp-content/uploads/2015/11/favicon.ico'
    ].includes(logo),
    `Logo is not in the list: ${logo}`
  )

  t.snapshot(metadata)
})
