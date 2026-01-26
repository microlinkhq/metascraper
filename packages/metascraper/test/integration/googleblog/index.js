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
  'https://cloudplatform.googleblog.com/2016/09/Google-Cloud-Platform-sets-a-course-for-new-horizons.html'

test('googleblog', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))

  const { logo, ...metadata } = await metascraper({ html, url })

  t.true(
    [
      'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://cloudplatform.googleblog.com/2016/09/Google-Cloud-Platform-sets-a-course-for-new-horizons.html&size=128',
      'https://cloudplatform.googleblog.com/favicon.ico'
    ].includes(logo),
    `Logo is not in the list: ${logo}`
  )

  t.snapshot(metadata)
})
