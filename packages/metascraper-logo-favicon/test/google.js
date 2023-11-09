'use strict'

const test = require('ava')
const got = require('got')

const { google } = require('..')

test('return undefined under no logo', async t => {
  const url = 'https://idontexist.lol'
  t.is(await google(url), undefined)
})

test('return logo when URL is reachable', async t => {
  const url = 'https://microlink.io/'
  const logoUrl = await google(url)
  t.true(typeof logoUrl === 'string')

  const fallbackUrl = google.url()
  const [logo, fallback] = await Promise.all(
    [logoUrl, fallbackUrl].map(url =>
      got(url, {
        responseType: 'buffer',
        resolveBodyOnly: true,
        throwHttpErrors: false
      })
    )
  )
  t.true(logo.length !== fallback.length)
})
