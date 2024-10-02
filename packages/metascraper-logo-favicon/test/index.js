'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

const { runServer } = require('./helpers')

const createMetascraper = opts => require('metascraper')([require('..')(opts)])

const createHtml = meta =>
  `<!DOCTYPE html>
<html lang="en">
<head>${meta.join('/n')}</head>
<body></body>
</html>`.trim()

test('provide `keyvOpts`', async t => {
  const cache = new Map()
  const metascraper = createMetascraper({ keyvOpts: { store: cache } })

  const metadataOne = await metascraper({ url: 'https://teslahunt.io' })
  t.truthy(metadataOne.logo)
  t.is(cache.size, 1)

  const metadataTwo = await metascraper({ url: 'https://lolwerhere.com' })
  t.falsy(metadataTwo.logo)
  t.is(cache.size, 2)
})

test('provide `pickFn`', async t => {
  const url = 'https://www.theverge.com'
  const html = await readFile(resolve(__dirname, 'fixtures/theverge.html'))

  const pickFn = (sizes, { pickDefault }) => {
    const appleTouchIcon = sizes.find(item => item.rel.includes('apple'))
    return (appleTouchIcon || pickDefault(sizes)).url
  }

  const metascraper = createMetascraper({ pickFn })
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.logo,
    'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395359/ios-icon.0.png'
  )
})

test('`pickFn` gets the bigger size by default', async t => {
  const url = 'https://www.theverge.com'
  const html = await readFile(resolve(__dirname, 'fixtures/theverge.html'))
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.logo,
    'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395351/android-chrome-192x192.0.png'
  )
})

test('create an absolute favicon url if the logo is not present', async t => {
  const url = 'https://www.nytimes.com'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url })
  t.is(metadata.logo, 'https://www.nytimes.com/favicon.ico')
})

test('get the biggest icon possible', async t => {
  const url = 'https://cdn.microlink.io'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="apple-touch-icon-precomposed" sizes="57x57" href="/logo/apple-touch-icon-57x57.png">',
    '<link rel="apple-touch-icon-precomposed" sizes="114x114" href="/logo/apple-touch-icon-114x114.png">',
    '<link rel="apple-touch-icon-precomposed" sizes="72x72" href="/logo/apple-touch-icon-72x72.png">',
    '<link rel="apple-touch-icon-precomposed" sizes="144x144" href="/logo/apple-touch-icon-144x144.png">',
    '<link rel="apple-touch-icon-precomposed" sizes="60x60" href="/logo/apple-touch-icon-60x60.png">',
    '<link rel="apple-touch-icon-precomposed" sizes="120x120" href="/logo/apple-touch-icon-120x120.png">',
    '<link rel="apple-touch-icon-precomposed" sizes="76x76" href="/logo/apple-touch-icon-76x76.png">',
    '<link rel="apple-touch-icon-precomposed" sizes="152x152" href="/logo/apple-touch-icon-152x152.png">',
    '<link rel="icon" type="image/png" href="/logo/favicon-196x196.png" sizes="196x196">',
    '<link rel="icon" type="image/png" href="/logo/favicon-96x96.png" sizes="96x96">',
    '<link rel="icon" type="image/png" href="/logo/favicon-32x32.png" sizes="32x32">',
    '<link rel="icon" type="image/png" href="/logo/favicon-16x16.png" sizes="16x16">',
    '<link rel="icon" type="image/png" href="/logo/favicon-128.png" sizes="128x128">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, 'https://cdn.microlink.io/logo/favicon-196x196.png')
})

test('prefers small png over large ico', async t => {
  const url = 'https://github.com'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="icon" type="image/png" href="/fluidicon.png" sizes="96x96">',
    '<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="128x128">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, 'https://github.com/fluidicon.png')
})

test('detect `rel="fluid-icon"`', async t => {
  const url = 'https://github.com'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="fluid-icon" href="https://github.com/fluidicon.png" title="GitHub">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, 'https://github.com/fluidicon.png')
})

test('detect `rel="mask-icon"`', async t => {
  const url = 'https://github.com'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="mask-icon" href="https://github.githubassets.com/pinned-octocat.svg" color="#000000">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, 'https://github.githubassets.com/pinned-octocat.svg')
})

test('detect `rel="alternate icon"`', async t => {
  const url = 'https://github.com'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="alternate icon" class="js-site-favicon" type="image/png" href="https://github.githubassets.com/favicons/favicon-dark.png">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.logo,
    'https://github.githubassets.com/favicons/favicon-dark.png'
  )
})

test('detect `rel="icon"`', async t => {
  const url = 'https://github.com'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="icon" class="js-site-favicon" type="image/svg+xml" href="https://github.githubassets.com/favicons/favicon-dark.svg">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.logo,
    'https://github.githubassets.com/favicons/favicon-dark.svg'
  )
})

test('detect `rel="apple-touch-icon-precomposed"`', async t => {
  const url = 'https://cdn.microlink.io/'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="apple-touch-icon-precomposed" sizes="144x144" href="logo/apple-touch-icon-144x144.png">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.logo,
    'https://cdn.microlink.io/logo/apple-touch-icon-144x144.png'
  )
})

test('detect `rel="apple-touch-icon"`', async t => {
  const url = 'https://cdn.microlink.io/'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="apple-touch-icon" sizes="144x144" href="logo/apple-touch-icon-144x144.png">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.logo,
    'https://cdn.microlink.io/logo/apple-touch-icon-144x144.png'
  )
})

test('detect `rel="shortcut icon"`', async t => {
  const url = 'https://cdn.microlink.io/'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="shortcut icon" href="logo/favicon.ico">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, 'https://cdn.microlink.io/logo/favicon.ico')
})

test('detect `rel="mask icon"`', async t => {
  const url = 'https://www.microsoft.com/design/fluent'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="mask-icon" href="https://assets.vercel.com/image/upload/q_auto/front/favicon/round-2/safari-pinned-tab.svg" color="#000000" importance="low">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.logo,
    'https://assets.vercel.com/image/upload/q_auto/front/favicon/round-2/safari-pinned-tab.svg'
  )
})

test('square logos has priority', async t => {
  const url =
    'https://www.engadget.com/2019-01-07-all-github-users-keep-code-private.html'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<meta name="msapplication-wide310x150logo" content="https://s.yimg.com/kw/assets/eng-e-558x270.png">',
    '<link rel="apple-touch-icon" sizes="114x114" href="https://s.yimg.com/kw/assets/apple-touch-icon-152x152.png">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.logo,
    'https://s.yimg.com/kw/assets/apple-touch-icon-152x152.png'
  )
})

test('detect size from `sizes`', async t => {
  const url = 'https://cdn.microlink.io/'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="icon" sizes="16x16 32x32 64x64" href="logo/favicon.ico">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, 'https://cdn.microlink.io/logo/favicon.ico')
})

test('use non square logo as in the worst scenario', async t => {
  const url =
    'https://www.engadget.com/2019-01-07-all-github-users-keep-code-private.html'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<meta name="msapplication-wide210x50logo" content="https://s.yimg.com/kw/assets/eng-e-458x170.png">',
    '<meta name="msapplication-wide310x150logo" content="https://s.yimg.com/kw/assets/eng-e-558x270.png">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, 'https://s.yimg.com/kw/assets/eng-e-558x270.png')
})

test('resolve logo using favicon associated with the domain', async t => {
  const url = 'https://cdn.teslahunt.io/foo/bar'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url })
  t.is(metadata.logo, 'https://teslahunt.io/favicon.ico')
})

test('resolve logo using favicon should be an image content-type', async t => {
  const url = 'https://vercel.app'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url })
  t.true(metadata.logo.includes('gstatic'))
})

test('resolve logo using from google associated with the domain', async t => {
  const url = 'https://vercel.app'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url })
  t.true(metadata.logo.includes('gstatic'))
})

test('avoid empty data URI', async t => {
  const url = 'https://www.adobe.com/'
  const html = '<link rel="icon" href="data:,">'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, 'https://www.adobe.com/favicon.ico')
})

test('avoid wrong data URI', async t => {
  const url = 'https://www.adobe.com/'
  const html = '<link rel="icon" href="data:">'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, 'https://www.adobe.com/favicon.ico')
})

test("favicon.ico detected in HTML markup can't be random content-type", async t => {
  const url = await runServer(t, async ({ res }) => {
    res.setHeader('content-type', 'image/svg+xml')
    res.end('<svg></svg>')
  })

  const html =
    '<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="120x116">'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, null)
})

test("don't trust in favicon.ico content-type", async t => {
  const url = await runServer(t, async ({ res }) => {
    res.setHeader('content-type', 'image/x-icon')
    res.end('<svg></svg>')
  })

  const html =
    '<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="120x116">'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, null)
})

test('favicon.ico detected in HTML markup can be `image/x-icon` content-type', async t => {
  const url = await runServer(t, async ({ res }) => {
    res.setHeader('content-type', 'image/x-icon')
    res.end()
  })

  const html =
    '<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="120x116">'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, `${url}favicon.ico`)
})

test('favicon.ico detected in HTML markup can be `image/vnd.microsoft.icon` content-type', async t => {
  const url = await runServer(t, async ({ res }) => {
    res.setHeader('content-type', 'image/vnd.microsoft.icon')
    res.end()
  })

  const html =
    '<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="120x116">'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, `${url}favicon.ico`)
})

test("favicon.png detected in HTML markup can't be random content-type", async t => {
  const url = await runServer(t, async ({ res }) => {
    res.setHeader('content-type', 'image/svg+xml')
    res.end('<svg></svg>')
  })

  const html =
    '<link rel="icon" href="/favicon.png" type="image/x-icon" sizes="120x116">'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, null)
})

test('favicon.png detected in HTML markup can be `image/png` content-type', async t => {
  const url = await runServer(t, async ({ res }) => {
    res.setHeader('content-type', 'image/png')
    res.end()
  })

  const html =
    '<link rel="icon" href="/favicon.png" type="image/x-icon" sizes="120x116">'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, `${url}favicon.png`)
})
