'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

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

test('from photo post', async t => {
  const url = 'https://www.instagram.com/p/CPeC-Eenc8l/'
  const html = await readFile(
    resolve(__dirname, 'fixtures/post-with-photo.html')
  )
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
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
