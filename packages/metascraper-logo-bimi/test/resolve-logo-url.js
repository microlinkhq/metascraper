'use strict'

const test = require('ava').default

const { resolveLogoUrl } = require('..')
const { runServer } = require('./helpers')

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" baseProfile="tiny-ps" />'

const serveLogo = (t, { contentType, statusCode = 200 } = {}) =>
  runServer(t, ({ res }) => {
    res.writeHead(
      statusCode,
      contentType ? { 'content-type': contentType } : {}
    )
    res.end(SVG)
  })

test('resolve when the logo is a reachable SVG', async t => {
  const logoUrl = `${await serveLogo(t, {
    contentType: 'image/svg+xml'
  })}logo.svg`
  t.is(await resolveLogoUrl(logoUrl), logoUrl)
})

test('resolve when the content type declares a charset', async t => {
  const contentType = 'image/svg+xml;charset=utf-8'
  const logoUrl = `${await serveLogo(t, { contentType })}logo.svg`
  t.is(await resolveLogoUrl(logoUrl), logoUrl)
})

test('return undefined when the logo is not reachable', async t => {
  const contentType = 'image/svg+xml'
  const logoUrl = `${await serveLogo(t, {
    contentType,
    statusCode: 404
  })}logo.svg`
  t.is(await resolveLogoUrl(logoUrl), undefined)
})

test('return undefined when the logo is not a SVG', async t => {
  const logoUrl = `${await serveLogo(t, { contentType: 'text/html' })}logo.svg`
  t.is(await resolveLogoUrl(logoUrl), undefined)
})

test('return undefined when the content type is missing', async t => {
  const logoUrl = `${await serveLogo(t)}logo.svg`
  t.is(await resolveLogoUrl(logoUrl), undefined)
})

test('return undefined when the host does not exist', async t => {
  t.is(await resolveLogoUrl('https://idontexist.lol/logo.svg'), undefined)
})
