'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava').default

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
  'http://www.theregister.co.uk/2016/05/03/emc_world_virtustream_announcement'

test('the-register', async t => {
  const html = await readFile(resolve(__dirname, 'input.html'))
  const metadata = await metascraper({ html, url })
  t.is(metadata.audio, null)
  t.is(metadata.author, 'Chris Mellor')
  t.is(metadata.date, '2016-05-04T14:14:38.000Z')
  t.is(
    metadata.description,
    'Announcement overload? Oh, you’ll love it just as much as Big Mickey Dell'
  )
  t.is(metadata.image, 'https://regmedia.co.uk/2016/05/04/raincloud_teaser.jpg')
  t.is(metadata.lang, 'en')
  t.true(
    typeof metadata.logo === 'string' && /^https?:\/\//.test(metadata.logo)
  )
  t.is(metadata.publisher, 'The Register')
  t.is(metadata.title, 'EMC makes a LEAP forward with Virtustream and more')
  t.is(
    metadata.url,
    'https://www.theregister.com/2016/05/03/emc_world_virtustream_announcement/'
  )
  t.is(metadata.video, null)
})
