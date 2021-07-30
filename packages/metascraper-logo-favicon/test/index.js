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
  it('create an absolute favicon url if the logo is not present', async () => {
    const url = 'https://www.nytimes.com'
    const metascraper = createMetascraper()
    const meta = await metascraper({ url, html: '' })
    should(meta.logo).be.equal('https://www.nytimes.com/favicon.ico')
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
    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal(
      'https://www.microsoft.com/design/assets/favicons/favicon-192.png'
    )
  })

  it('`pickFn` gets the bigger size by default', async () => {
    const url = 'https://www.theverge.com'
    const html = await readFile(resolve(__dirname, 'fixtures/theverge.html'))
    const metascraper = createMetascraper()
    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal(
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
    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal(
      'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395359/ios-icon.0.png'
    )
  })

  it('detect `rel="fluid-icon"`', async () => {
    const url = 'https://github.com'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="fluid-icon" href="https://github.com/fluidicon.png" title="GitHub">'
    ])
    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal('https://github.com/fluidicon.png')
  })

  it('detect `rel="mask-icon"`', async () => {
    const url = 'https://github.com'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="mask-icon" href="https://github.githubassets.com/pinned-octocat.svg" color="#000000">'
    ])
    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal(
      'https://github.githubassets.com/pinned-octocat.svg'
    )
  })

  it('detect `rel="alternate icon"`', async () => {
    const url = 'https://github.com'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="alternate icon" class="js-site-favicon" type="image/png" href="https://github.githubassets.com/favicons/favicon-dark.png">'
    ])
    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal(
      'https://github.githubassets.com/favicons/favicon-dark.png'
    )
  })

  it('detect `rel="icon"`', async () => {
    const url = 'https://github.com'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="icon" class="js-site-favicon" type="image/svg+xml" href="https://github.githubassets.com/favicons/favicon-dark.svg">'
    ])
    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal(
      'https://github.githubassets.com/favicons/favicon-dark.svg'
    )
  })

  it('detect `rel="shortcut icon"`', async () => {
    const url = 'https://www.microsoft.com/design/fluent'
    const metascraper = createMetascraper()
    const html = createHtml([
      '<link rel="shortcut icon" href="assets/favicons/favicon.ico">'
    ])
    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal(
      'https://www.microsoft.com/design/assets/favicons/favicon.ico'
    )
  })

  it('returns null if logo is not detected', async () => {
    const url = 'https://liu.edu/Brooklyn'
    const html = await readFile(resolve(__dirname, 'fixtures/liuedu.html'))
    const metascraper = createMetascraper()
    const meta = await metascraper({ url, html })

    should(meta.logo).be.null()
  })
})
