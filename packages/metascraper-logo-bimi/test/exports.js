'use strict'

const test = require('ava').default

const createGetLogo = require('bimi-url')
const metascraperLogoBimi = require('..')

test('the BIMI resolver is re-exported, not re-implemented', t => {
  t.is(metascraperLogoBimi.createGetLogo, createGetLogo)
  t.is(metascraperLogoBimi.resolveLogoUrl, createGetLogo.resolveLogoUrl)
  t.is(metascraperLogoBimi.toLogoUrl, createGetLogo.toLogoUrl)
})
