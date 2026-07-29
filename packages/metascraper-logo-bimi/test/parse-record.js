'use strict'

const test = require('ava').default

const { parseRecord } = require('..')
const { LOGO_URL, RECORD } = require('./helpers')

test('get the logo location', t => {
  t.is(parseRecord(RECORD), LOGO_URL)
})

test('get the logo location when a certificate is present', t => {
  t.is(
    parseRecord(`v=BIMI1; l=${LOGO_URL}; a=https://microlink.io/vmc.pem`),
    LOGO_URL
  )
})

test('get the logo location without trailing semicolon', t => {
  t.is(parseRecord(`v=BIMI1; l=${LOGO_URL}`), LOGO_URL)
})

test('get the logo location without whitespace', t => {
  t.is(parseRecord(`v=BIMI1;l=${LOGO_URL};`), LOGO_URL)
})

test('tag names are case insensitive', t => {
  t.is(parseRecord(`V=bimi1; L=${LOGO_URL};`), LOGO_URL)
})

test('return undefined for a declination record', t => {
  t.is(parseRecord('v=BIMI1; l=;'), undefined)
  t.is(parseRecord('v=BIMI1; l=; a=;'), undefined)
})

test('return undefined when the logo location is missing', t => {
  t.is(parseRecord('v=BIMI1; a=https://microlink.io/vmc.pem;'), undefined)
  t.is(parseRecord('v=BIMI1;'), undefined)
})

test('return undefined when the logo location is not https', t => {
  t.is(parseRecord('v=BIMI1; l=http://microlink.io/logo.svg;'), undefined)
  t.is(parseRecord('v=BIMI1; l=/logo.svg;'), undefined)
})

test('return undefined when the version tag is not first', t => {
  t.is(parseRecord(`l=${LOGO_URL}; v=BIMI1;`), undefined)
})

test('return undefined for a record of a different protocol', t => {
  t.is(parseRecord('v=spf1 include:_spf.google.com ~all'), undefined)
  t.is(parseRecord('v=DMARC1; p=reject;'), undefined)
  t.is(parseRecord(''), undefined)
})
