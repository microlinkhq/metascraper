'use strict'

const { readFile } = require('fs').promises
const { resolve } = require('path')
const should = require('should')

const createMetascraper = opts => require('metascraper')([require('..')(opts)])

const createHtml = meta =>
  `<!DOCTYPE html>
<html lang="en">
<head>${meta.join('/n')}</head>
<body></body>
</html>`.trim()

describe('metascraper-logo-favicon', () => {
  describe('options', () => {
    it('keyvOpts', async () => {
      const cache = new Map()
      const url = 'https://example.com'
      const metascraper = createMetascraper({ keyvOpts: { store: cache } })
      await metascraper({ url })
      should(cache.size).be.equal(1)
    })
  })

  it('create an absolute favicon url if the logo is not present', async () => {
    const url = 'https://www.nytimes.com'
    const metascraper = createMetascraper()
    const metadata = await metascraper({ url })
    should(metadata.logo).be.equal('https://www.nytimes.com/favicon.ico')
  })

  it('get the biggest icon possible', async () => {
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
    should(metadata.logo).be.equal(
      'https://www.microsoft.com/design/assets/favicons/favicon-192.png'
    )
  })

  it('`pickFn` gets the bigger size by default', async () => {
    const url = 'https://www.theverge.com'
    const html = await readFile(resolve(__dirname, 'fixtures/theverge.html'))
    const metascraper = createMetascraper()
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal(
      'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395351/android-chrome-192x192.0.png'
    )
  })

  it('provide a custom `pickFn`', async () => {
    const url = 'https://www.theverge.com'
    const html = await readFile(resolve(__dirname, 'fixtures/theverge.html'))
    const pickFn = (sizes, pickDefault) => {
      const appleTouchIcon = sizes.find(item => item.rel.includes('apple'))
      return appleTouchIcon || pickDefault(sizes)
    }
    const metascraper = createMetascraper({ pickFn })
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal(
      'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395359/ios-icon.0.png'
    )
  })

  it('detect `rel="fluid-icon"`', async () => {
    const url = 'https://github.com'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="fluid-icon" href="https://github.com/fluidicon.png" title="GitHub">'
    ])
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal('https://github.com/fluidicon.png')
  })

  it('detect `rel="mask-icon"`', async () => {
    const url = 'https://github.com'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="mask-icon" href="https://github.githubassets.com/pinned-octocat.svg" color="#000000">'
    ])
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal(
      'https://github.githubassets.com/pinned-octocat.svg'
    )
  })

  it('detect `rel="alternate icon"`', async () => {
    const url = 'https://github.com'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="alternate icon" class="js-site-favicon" type="image/png" href="https://github.githubassets.com/favicons/favicon-dark.png">'
    ])
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal(
      'https://github.githubassets.com/favicons/favicon-dark.png'
    )
  })

  it('detect `rel="icon"`', async () => {
    const url = 'https://github.com'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="icon" class="js-site-favicon" type="image/svg+xml" href="https://github.githubassets.com/favicons/favicon-dark.svg">'
    ])
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal(
      'https://github.githubassets.com/favicons/favicon-dark.svg'
    )
  })

  it('detect `rel="apple-touch-icon-precomposed"`', async () => {
    const url = 'https://github.com'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="apple-touch-icon-precomposed" sizes="114x114" href="assets/favicons/favicon-114.png">'
    ])
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal(
      'https://github.com/assets/favicons/favicon-114.png'
    )
  })

  it('detect `rel="apple-touch-icon"`', async () => {
    const url = 'https://github.com'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="apple-touch-icon" sizes="114x114" href="assets/favicons/favicon-114.png">'
    ])
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal(
      'https://github.com/assets/favicons/favicon-114.png'
    )
  })

  it('detect `rel="shortcut icon"`', async () => {
    const url = 'https://www.microsoft.com/design/fluent'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="shortcut icon" href="assets/favicons/favicon.ico">'
    ])
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal(
      'https://www.microsoft.com/design/assets/favicons/favicon.ico'
    )
  })

  it('detect `rel="mask icon"`', async () => {
    const url = 'https://www.microsoft.com/design/fluent'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="mask-icon" href="https://assets.vercel.com/image/upload/q_auto/front/favicon/round-2/safari-pinned-tab.svg" color="#000000" importance="low">'
    ])
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal(
      'https://assets.vercel.com/image/upload/q_auto/front/favicon/round-2/safari-pinned-tab.svg'
    )
  })

  it('square logos has priority', async () => {
    const url =
      'https://www.engadget.com/2019-01-07-all-github-users-keep-code-private.html'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<meta name="msapplication-wide310x150logo" content="https://s.yimg.com/kw/assets/eng-e-558x270.png">',
      '<link rel="apple-touch-icon" sizes="114x114" href="assets/favicons/favicon-114.png">'
    ])
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal(
      'https://www.engadget.com/assets/favicons/favicon-114.png'
    )
  })

  it('detect size from `sizes`', async () => {
    const url = 'https://example.com'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="icon" sizes="16x16 32x32 64x64" href="assets/favicons/favicon.ico">'
    ])
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal(
      'https://example.com/assets/favicons/favicon.ico'
    )
  })

  it('use non square logo as in the worst scenario', async () => {
    const url =
      'https://www.engadget.com/2019-01-07-all-github-users-keep-code-private.html'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<meta name="msapplication-wide210x50logo" content="https://s.yimg.com/kw/assets/eng-e-458x170.png">',
      '<meta name="msapplication-wide310x150logo" content="https://s.yimg.com/kw/assets/eng-e-558x270.png">'
    ])
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.equal(
      'https://s.yimg.com/kw/assets/eng-e-558x270.png'
    )
  })

  it('returns null if logo is not detected', async () => {
    const url = 'https://liu.edu/Brooklyn'
    const html = await readFile(resolve(__dirname, 'fixtures/liuedu.html'))
    const metascraper = createMetascraper()
    const metadata = await metascraper({ url, html })
    should(metadata.logo).be.null()
  })

  it('resolve domain favicon', async () => {
    const url = 'https://cdn.teslahunt.io/foo/bar'
    const metascraper = createMetascraper()
    const metadata = await metascraper({ url })
    should(metadata.logo).be.equal('https://teslahunt.io/favicon.ico')
  })
})
