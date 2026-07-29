'use strict'

const test = require('ava').default

const { createGetLogo } = require('..')
const { acceptLogoUrl } = require('./helpers')

test('resolve a real BIMI record over the system resolver', async t => {
  const getLogo = createGetLogo({ resolveLogoUrl: acceptLogoUrl })
  t.regex(await getLogo('microlink.io'), /^https:\/\/.+\.svg$/)
})
