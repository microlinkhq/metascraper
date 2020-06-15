'use strict'

const { readFile } = require('fs').promises
const { resolve } = require('path')
const should = require('should')

const createMetascraper = opts => require('metascraper')([require('..')(opts)])

describe('metascraper-logo-favicon', () => {
  it('create an absolute favicon url if the logo is not present', async () => {
    const url = 'https://www.nytimes.com'
    const metascraper = createMetascraper()
    const meta = await metascraper({ url, html: '' })
    should(meta.logo).be.equal('https://www.nytimes.com/favicon.ico')
  })

  it('`pickFn` gets the bigger size by default', async () => {
    const url = 'https://www.theverge.com'
    const html = await readFile(resolve(__dirname, 'fixtures/input.html'))
    const metascraper = createMetascraper()
    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal(
      'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395351/android-chrome-192x192.0.png'
    )
  })

  it('provide a custom `pickFn`', async () => {
    const url = 'https://www.theverge.com'
    const html = await readFile(resolve(__dirname, 'fixtures/input.html'))
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
})
