'use strict'

const test = require('ava')

const { getTweetId } = require('../../src/get-media/util')

test('remove query parameters', t => {
  const tweetId = getTweetId(
    'https://twitter.com/brodieseo/status/1512193631482163206?ref_src=twsrc%5Etfw'
  )
  t.is(tweetId, '1512193631482163206')
})
