'use strict'

const test = require('ava')

const { favicon } = require('..')

test('return undefined if favicon is not reachable', async t => {
  const url = 'https://idontexist.lol'
  t.is(await favicon(url), undefined)
})

test("with { contentType: 'image/vnd.microsoft.icon' }", async t => {
  const url = 'https://microlink.io/'
  t.is(await favicon(url), 'https://microlink.io/favicon.ico')
})
