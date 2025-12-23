'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const metascraperX = require('metascraper-x')

const createMetascraper = (...args) =>
  require('metascraper')([
    metascraperX(...args),
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-image')(),
    require('metascraper-video')(),
    require('metascraper-description')(),
    require('metascraper-lang')(),
    require('metascraper-publisher')(),
    require('metascraper-title')(),
    require('metascraper-url')()
  ])

test('from a X profile', async t => {
  const url = 'https://x.com/kikobeats?mx=2'
  const html = await readFile(resolve(__dirname, 'fixtures/profile.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a X profile from og:image', async t => {
  const url = 'https://x.com/kikobeats?mx=2'
  const html = await readFile(resolve(__dirname, 'fixtures/profile-og.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a X profile resolving URLs', async t => {
  const url = 'https://x.com/Kikobeats'
  const html = await readFile(resolve(__dirname, 'fixtures/profile.html'))

  const resolveUrl = async shortUrl => {
    const { url } = await fetch(shortUrl, { method: 'HEAD' })
    const urlObj = new URL(url)
    urlObj.search = ''
    return urlObj.toString().replace('https://', '').replace('/', '')
  }

  const metascraper = createMetascraper({ resolveUrl })
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a X profile from og:image resolving URLs', async t => {
  const url = 'https://x.com/Kikobeats'
  const html = await readFile(resolve(__dirname, 'fixtures/profile-og.html'))

  const resolveUrl = async shortUrl => {
    const { url } = await fetch(shortUrl, { method: 'HEAD' })
    const urlObj = new URL(url)
    urlObj.search = ''
    return urlObj.toString().replace('https://', '').replace('/', '')
  }

  const metascraper = createMetascraper({ resolveUrl })
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a X profile with posts with video', async t => {
  const url = 'https://x.com/javilop'
  const html = await readFile(resolve(__dirname, 'fixtures/profile-video.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a X profile with posts with video from og:image', async t => {
  const url = 'https://x.com/javilop'
  const html = await readFile(
    resolve(__dirname, 'fixtures/profile-video-og.html')
  )
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a post', async t => {
  const url = 'https://x.com/realDonaldTrump/status/1222907250383245320'
  const html = await readFile(resolve(__dirname, 'fixtures/post.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a post from og:image', async t => {
  const url = 'https://x.com/realDonaldTrump/status/1222907250383245320'
  const html = await readFile(resolve(__dirname, 'fixtures/post-og.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a post with a gif', async t => {
  const url = 'https://x.com/Kikobeats/status/880139124791029763'
  const html = await readFile(resolve(__dirname, 'fixtures/post-gif.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a post with a gif from og:image', async t => {
  const url = 'https://x.com/Kikobeats/status/880139124791029763'
  const html = await readFile(resolve(__dirname, 'fixtures/post-gif-og.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a post with an image', async t => {
  const url = 'https://x.com/UaSmart/status/934106870834454529'
  const html = await readFile(resolve(__dirname, 'fixtures/post-image.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a post with an image from og:image', async t => {
  const url = 'https://x.com/UaSmart/status/934106870834454529'
  const html = await readFile(resolve(__dirname, 'fixtures/post-image-og.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a post with a video', async t => {
  const url = 'https://x.com/verge/status/957383241714970624'
  const html = await readFile(resolve(__dirname, 'fixtures/post-video.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a post with a video from og:image', async t => {
  const url = 'https://x.com/verge/status/957383241714970624'
  const html = await readFile(resolve(__dirname, 'fixtures/post-video-og.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})

test('from a post with a name containing "on X"', async t => {
  const url = 'https://x.com/elonx/status/1234567890'
  const html = await readFile(resolve(__dirname, 'fixtures/post-on-x.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.snapshot(metadata)
})
