'use strict'

const { readFile } = require('fs/promises')
const { resolve } = require('path')
const test = require('ava')

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
  const pickFn = (sizes, pickDefault) => {
    const appleTouchIcon = sizes.find(item => item.rel.includes('apple'))
    return appleTouchIcon || pickDefault(sizes)
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
  const url = 'https://www.microsoft.com/design/fluent'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="apple-touch-icon" href="assets/favicons/favicon-57.png">',
    '<link rel="apple-touch-icon" sizes="114x114" href="assets/favicons/favicon-114.png">',
    '<link rel="apple-touch-icon" sizes="72x72" href="assets/favicons/favicon-72.png">',
    '<link rel="apple-touch-icon" sizes="144x144" href="assets/favicons/favicon-144.png">',
    '<link rel="apple-touch-icon" sizes="60x60" href="assets/favicons/favicon-60.png">',
    '<link rel="apple-touch-icon" sizes="120x120" href="assets/favicons/favicon-120.png">',
    '<link rel="apple-touch-icon" sizes="76x76" href="assets/favicons/favicon-76.png">',
    '<link rel="apple-touch-icon" sizes="152x152" href="assets/favicons/favicon-152.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="assets/favicons/favicon-180.png"></link>',
    '<link rel="shortcut icon" href="assets/favicons/favicon.ico">',
    '<link rel="icon" sizes="16x16 32x32 64x64" href="assets/favicons/favicon.ico">',
    '<link rel="icon" type="image/png" sizes="196x196" href="assets/favicons/favicon-192.png">',
    '<link rel="icon" type="image/png" sizes="160x160" href="assets/favicons/favicon-160.png">',
    '<link rel="icon" type="image/png" sizes="96x96" href="assets/favicons/favicon-96.png">',
    '<link rel="icon" type="image/png" sizes="64x64" href="assets/favicons/favicon-64.png">',
    '<link rel="icon" type="image/png" sizes="32x32" href="assets/favicons/favicon-32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="assets/favicons/favicon-16.png">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.logo,
    'https://www.microsoft.com/design/assets/favicons/favicon-192.png'
  )
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
  const url = 'https://github.com'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="apple-touch-icon-precomposed" sizes="114x114" href="assets/favicons/favicon-114.png">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, 'https://github.com/assets/favicons/favicon-114.png')
})

test('detect `rel="apple-touch-icon"`', async t => {
  const url = 'https://github.com'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="apple-touch-icon" sizes="114x114" href="assets/favicons/favicon-114.png">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, 'https://github.com/assets/favicons/favicon-114.png')
})

test('detect `rel="shortcut icon"`', async t => {
  const url = 'https://www.microsoft.com/design/fluent'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="shortcut icon" href="assets/favicons/favicon.ico">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.logo,
    'https://www.microsoft.com/design/assets/favicons/favicon.ico'
  )
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
    '<link rel="apple-touch-icon" sizes="114x114" href="assets/favicons/favicon-114.png">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(
    metadata.logo,
    'https://www.engadget.com/assets/favicons/favicon-114.png'
  )
})

test('detect size from `sizes`', async t => {
  const url = 'https://example.com'
  const metascraper = createMetascraper()
  const html = createHtml([
    '<link rel="icon" sizes="16x16 32x32 64x64" href="assets/favicons/favicon.ico">'
  ])
  const metadata = await metascraper({ url, html })
  t.is(metadata.logo, 'https://example.com/assets/favicons/favicon.ico')
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

test('resolve logo using from google associated with the domain', async t => {
  const url = 'https://escritopor.elenatorro.com'
  const metascraper = createMetascraper()
  const metadata = await metascraper({ url })
  t.true(metadata.logo.includes('gstatic'))
})
