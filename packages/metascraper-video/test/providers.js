'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const createMetascraper = (...args) =>
  require('metascraper')([require('..')(...args)])

test('giphy.com', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/giphy.com.html')
  )
  const url = 'https://giphy.com/gifs/the-office-no-steve-carell-12XMGIWtrHBl5e'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('clips.twitch.tv', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/clip.twitch.tv.html')
  )
  const url = 'https://clips.twitch.tv/GorgeousFunnyNeanderthalBIRB'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.snapshot(metadata)
})

test('medal.tv', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/medal.tv.html')
  )
  const url =
    'https://medal.tv/games/rocket-league/clips/1nEKJA2AvZCM9F/kheYib2fuArn'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })
  t.true(metadata.video.includes('.mp4'))
})

test('9gag.com', async t => {
  const html = await readFile(
    resolve(__dirname, 'fixtures/providers/9gag.com.html')
  )
  const url = 'https://9gag.com/gag/abY5Mm9'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ html, url })

  t.is(
    metadata.video,
    'https://img-9gag-fun.9cache.com/photo/abY5Mm9_460svvp9.webm'
  )
})
