'use strict'

const test = require('ava')

const { getImage } = require('..')

test('twitter', async t => {
  const payload = require('./fixtures/provider/twitter.json')
  const image = await getImage(payload.webpage_url, payload)
  t.is(image, 'https://pbs.twimg.com/media/DRg1OMRVwAEuwTK.jpg')
})

test('vimeo', async t => {
  const payload = require('./fixtures/provider/vimeo.json')
  const image = await getImage(payload.webpage_url, payload)
  t.is(
    image,
    'https://i.vimeocdn.com/filter/overlay?src0=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F934461428-d5f05644e5b9d3200b3dd08549375bd66b36981c35cefd3696c73b10fa263447-d_1280x720&src1=https%3A%2F%2Ff.vimeocdn.com%2Fimages_v6%2Fshare%2Fplay_icon_overlay.png'
  )
})

test('youtube', async t => {
  const payload = require('./fixtures/provider/youtube.json')
  const image = await getImage(payload.webpage_url, payload)
  t.is(image, 'https://i.ytimg.com/vi/hwMkbaS_M_c/maxresdefault.jpg')
})
