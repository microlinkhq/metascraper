'use strict'

const test = require('ava').default

const { createGetLogo } = require('..')

test('resolve a real BIMI record over the system resolver', async t => {
  const getLogo = createGetLogo()
  t.is(await getLogo('microlink.io'), 'https://cdn.microlink.io/logo/logo.svg')
})

test('return undefined for a domain without a BIMI record', async t => {
  const getLogo = createGetLogo()
  t.is(await getLogo('example.com'), undefined)
})
