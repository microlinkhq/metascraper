'use strict'

const test = require('ava')

const { getImage } = require('..')

test('twitter', async t => {
  const payload = require('./fixtures/provider/twitter.json')
  const image = await getImage(payload.webpage_url, payload)
  t.is(image, 'https://pbs.twimg.com/media/DRg1OMRVwAEuwTK.jpg?name=orig')
})

test('vimeo', async t => {
  const payload = require('./fixtures/provider/vimeo.json')
  const image = await getImage(payload.webpage_url, payload)
  t.is(
    image,
    'https://i.vimeocdn.com/video/934461428-d5f05644e5b9d3200b3dd08549375bd66b36981c35cefd3696c73b10fa263447-d_1280'
  )
})

test('youtube', async t => {
  const payload = require('./fixtures/provider/youtube.json')
  const image = await getImage(payload.webpage_url, payload)
  t.is(image, 'https://i.ytimg.com/vi_webp/hwMkbaS_M_c/maxresdefault.webp')
})
