'use strict'

const clearModule = require('clear-module')
const { promisify } = require('util')
const { resolve } = require('path')
const should = require('should')
const fs = require('fs')

const readFile = promisify(fs.readFile)

describe('custom rules', () => {
  before(() => {
    clearModule.all()
    process.env.METASCRAPER_CONFIG_CWD = __dirname
  })

  after(() => {
    clearModule.all()
    delete process.env.METASCRAPER_CONFIG_CWD
  })

  it('metascraper-soundcloud', async () => {
    const metascraper = require('../../..')
    const url =
      'https://soundcloud.com/beautybrainsp/beauty-brain-swag-bandicoot'
    const html = await readFile(
      resolve(__dirname, '../../integration/soundcloud/input.html')
    )

    const meta = await metascraper({ url, html })
    should(meta.author).be.equal('Beauty Brain')
  })

  it('metascraper-clearbit-logo', async () => {
    const metascraper = require('../../..')
    const url = 'https://facebook.com'
    const html = '<div></div>'

    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal(
      'https://logo.clearbit.com/facebook.com?size=128&format=jpg'
    )
  })
})
