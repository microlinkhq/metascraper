'use strict'

const test = require('ava')

const { pickBiggerSize } = require('..')

test('ensure logo is reachable', async t => {
  const sizes = [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: 'https://www.android.com/=w16',
      url: 'https://www.android.com/=w16',
      size: { height: 16, width: 16, square: true, priority: 80 }
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: 'https://www.android.com/=w32',
      url: 'https://www.android.com/=w32',
      size: { height: 32, width: 32, square: true, priority: 160 }
    },
    {
      rel: 'apple-touch-icon-precomposed',
      sizes: '180x180',
      href: 'https://www.android.com/=w180',
      url: 'https://www.android.com/=w180',
      size: { height: 180, width: 180, square: true, priority: 900 }
    },
    {
      rel: 'shortcut icon',
      href: 'https://www.android.com/static/img/favicon.ico?cache=33c79c9',
      url: 'https://www.android.com/static/img/favicon.ico?cache=33c79c9',
      size: { width: 0, height: 0, square: true, priority: 5 }
    }
  ]

  t.is(
    await pickBiggerSize(sizes),
    'https://www.android.com/static/img/favicon.ico?cache=33c79c9'
  )
})
