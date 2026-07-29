'use strict'

const test = require('ava').default

const {
  LOGO_URL,
  RECORD,
  createGetLogoFrom,
  createResolveTxt
} = require('./helpers')

const getLogoOf = record =>
  createGetLogoFrom(
    createResolveTxt({ 'default._bimi.microlink.io': [[record]] })
  )('microlink.io')

test('get the logo location', async t => {
  t.is(await getLogoOf(RECORD), LOGO_URL)
})

test('get the logo location when a certificate is present', async t => {
  t.is(
    await getLogoOf(`v=BIMI1; l=${LOGO_URL}; a=https://microlink.io/vmc.pem`),
    LOGO_URL
  )
})

test('get the logo location without trailing semicolon', async t => {
  t.is(await getLogoOf(`v=BIMI1; l=${LOGO_URL}`), LOGO_URL)
})

test('get the logo location without whitespace', async t => {
  t.is(await getLogoOf(`v=BIMI1;l=${LOGO_URL};`), LOGO_URL)
})

test('tag names are case insensitive', async t => {
  t.is(await getLogoOf(`V=bimi1; L=${LOGO_URL};`), LOGO_URL)
})

test('return undefined for a declination record', async t => {
  t.is(await getLogoOf('v=BIMI1; l=;'), undefined)
})

test('return undefined when the logo location is missing', async t => {
  t.is(await getLogoOf('v=BIMI1; a=https://microlink.io/vmc.pem;'), undefined)
  t.is(await getLogoOf('v=BIMI1;'), undefined)
})

test('return undefined when the logo location is not https', async t => {
  t.is(await getLogoOf('v=BIMI1; l=http://microlink.io/logo.svg;'), undefined)
  t.is(await getLogoOf('v=BIMI1; l=/logo.svg;'), undefined)
})

test('return undefined when the version tag is not first', async t => {
  t.is(await getLogoOf(`l=${LOGO_URL}; v=BIMI1;`), undefined)
})

test('return undefined when the record is not BIMI', async t => {
  t.is(await getLogoOf('v=spf1 include:_spf.google.com ~all'), undefined)
  t.is(await getLogoOf('v=DMARC1; p=reject;'), undefined)
  t.is(await getLogoOf(''), undefined)
})
