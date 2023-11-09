'use strict'

const test = require('ava')

const { favicon } = require('..')

test('with { contentType: \'image/vnd.microsoft.icon\' }', async t => {
  const url = 'https://microlink.io/'
  t.is(await favicon(url), 'https://microlink.io/favicon.ico')
})
