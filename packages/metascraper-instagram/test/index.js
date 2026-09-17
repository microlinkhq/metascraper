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

test('prefers image_versions2 over 640 og:image on posts', async t => {
  const url = 'https://www.instagram.com/p/DdWpGUXgJTg/'
  const html = `<html><head>
    <meta property="og:image" content="https://scontent.cdninstagram.com/v/photo.jpg?stp=dst-jpg_e35_s640x640_tt6">
  </head><body><script>{"image_versions2":{"candidates":[{"url":"https://instagram.fna.fbcdn.net/v/photo.jpg?stp=dst-jpg_e35_p1179x1179_tt6\\u0026oh=hd"},{"url":"https://instagram.fna.fbcdn.net/v/photo.jpg?stp=dst-jpg_e35_p412x412_tt6"}]}}</script></body></html>`
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.image,
    'https://instagram.fna.fbcdn.net/v/photo.jpg?stp=dst-jpg_e35_p1179x1179_tt6&oh=hd'
  )
})

test('does not use grid image_versions2 on profiles', async t => {
  const url = 'https://www.instagram.com/evolving.ai?next=/p/example/'
  const html = `<html><head>
    <meta property="og:image" content="https://scontent.cdninstagram.com/v/avatar.jpg?stp=dst-jpg_e0_s150x150_tt6">
  </head><body><script>{"image_versions2":{"candidates":[{"url":"https://instagram.fna.fbcdn.net/v/photo.jpg?stp=dst-jpg_e35_p1179x1179_tt6"}]}}</script></body></html>`
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.image,
    'https://scontent.cdninstagram.com/v/avatar.jpg?stp=dst-jpg_e0_s150x150_tt6'
  )
})

test('prefers apple-touch-icon 180 over a tiny favicon', async t => {
  const url = 'https://www.instagram.com/evolving.ai'
  const html = `<html><head>
    <link rel="icon" sizes="192x192" href="https://static.cdninstagram.com/rsrc.php/yr/r/rzWiSjZRxk5.webp">
    <link rel="apple-touch-icon" sizes="180x180" href="https://static.cdninstagram.com/rsrc.php/yw/r/icwX0xAk0pz.webp">
    <link rel="shortcut icon" href="https://static.cdninstagram.com/rsrc.php/y4/r/QaBlI0OZiks.ico">
  </head></html>`
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.logo,
    'https://static.cdninstagram.com/rsrc.php/yw/r/icwX0xAk0pz.webp'
  )
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
