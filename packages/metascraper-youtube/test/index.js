'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const { metascraper } = require('./helpers')

test('get the high image size', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/image-size.html'))
  const url = 'https://www.youtube.com/watch?v=A0FZIwabctw'
  const { date, ...metadata } = await metascraper({ html, url })
  t.is(typeof date, 'string')
  t.snapshot(metadata)
})

test('youtube video', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/youtube-video.html'))
  const url = 'https://www.youtube.com/watch?v=hwMkbaS_M_c'

  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('youtube video old', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/youtube-video-old.html')
  )
  const url = 'https://www.youtube.com/watch?v=GDRd-BFTYIg'

  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('youtube channel', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/youtube-channel.html')
  )
  const url = 'https://www.youtube.com/channel/UCzcRQ3vRNr6fJ1A9rqFn7QA'

  const { date, ...metadata } = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('youtube list', async t => {
  const html = await readFile(resolve(__dirname, 'fixtures/youtube-list.html'))
  const url =
    'https://www.youtube.com/watch?v=EAZvxukW8kY&list=PLDB4BCE9817AE7B43&index=11'

  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})
