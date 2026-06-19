'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava').default

const metascraper = require('metascraper')([
  require('metascraper-instagram')(),
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-lang')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

test('code is resilient', async t => {
  const url = 'https://www.instagram.com/p/CPeC-Eenc8l/'
  const metadata = await metascraper({ url })
  t.snapshot({
    ...metadata,
    /* prevent snapshot from failing */
    logo: metadata.logo.replace(
      /^https:\/\/t\d\.gstatic\.com/,
      'https://t2.gstatic.com'
    )
  })
})

test('from photo post', async t => {
  const url = 'https://www.instagram.com/p/CPeC-Eenc8l/'
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-with-photo.html')
  )
  const metadata = await metascraper({ url, html })
  t.is(metadata.author, 'Willyrex')
  t.is(metadata.publisher, 'Instagram')
  t.is(metadata.title, 'Willyrex (@willyrex) • Instagram photo')
  t.is(metadata.url, url)
  t.is(metadata.lang, 'en')
  t.true(metadata.description.includes('May 29, 2021'))
  t.true(metadata.image.startsWith('https://scontent-'))
  t.true(metadata.logo.includes('cdninstagram.com'))
  t.true(metadata.date === null || metadata.date === '2021-05-29T00:00:00.000Z')
})

test('from multi photo post', async t => {
  const url = 'https://www.instagram.com/p/COn3M4TnRi1/'
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-with-multi-photo.html')
  )
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from video post', async t => {
  const url = 'https://www.instagram.com/p/CPQjO5RIIO9/'
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-with-video.html')
  )
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from clip post', async t => {
  const url = 'https://www.instagram.com/p/CN2VQ1yI_MA/'
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-with-clip.html')
  )
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from igtv', async t => {
  const url = 'https://www.instagram.com/p/CIoLRFIIL50/'
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-with-igtv.html')
  )
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from profile', async t => {
  const url = 'https://www.instagram.com/pluto__travel/'
  const html = await readFile(resolve(__dirname, 'fixtures/profile.html'))
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from story', async t => {
  const url =
    'https://www.instagram.com/stories/jaimelorentelo/2591639087680304855/'
  const html = await readFile(resolve(__dirname, 'fixtures/story.html'))
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})
