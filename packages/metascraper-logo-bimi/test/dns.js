'use strict'

const test = require('ava').default

const { createGetLogo } = require('..')

test('resolve a real BIMI record over the system resolver', async t => {
  const getLogo = createGetLogo()
  t.regex(await getLogo('microlink.io'), /^https:\/\/.+\.svg$/)
})
