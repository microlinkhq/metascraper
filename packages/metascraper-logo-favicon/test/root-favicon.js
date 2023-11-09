'use strict'

const test = require('ava')
const got = require('got')

const { createGetLogo, createRootFavicon, google } = require('..')

test('enable it by default', async t => {
  const getLogo = createGetLogo({ withGoogle: true, withFavicon: true })
  const rootFavicon = createRootFavicon({ getLogo })
  const url = 'https://geolocation-indol.vercel.app/'
  const logoUrl = await rootFavicon({ url })
  const domainLogoUrl = google.url('https://vercel.app/')

  const [logo, domainLogo] = await Promise.all(
    [logoUrl, domainLogoUrl].map(url =>
      got(url, {
        responseType: 'buffer',
        resolveBodyOnly: true,
        throwHttpErrors: false
      })
    )
  )

  t.is(logo.length, domainLogo.length)
})

test('exclude certain subdomains', async t => {
  const getLogo = createGetLogo({ withGoogle: true, withFavicon: true })
  const rootFavicon = createRootFavicon({
    getLogo,
    withRootFavicon: /^vercel\.app/
  })
  const url = 'https://geolocation-indol.vercel.app/'
  const logoUrl = await rootFavicon({ url })
  t.is(logoUrl, undefined)
})

test('disable it when \'{ withRootFavicon: false}\'', async t => {
  const rootFavicon = createRootFavicon({ withRootFavicon: false })
  t.is(rootFavicon, undefined)
})
