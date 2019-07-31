'use strict'

const { promisify } = require('util')
const { resolve } = require('path')
const should = require('should')
const fs = require('fs')

const metascraper = require('metascraper')([require('..')()])

const readFile = promisify(fs.readFile)

describe('metascraper-logo-favicon', () => {
  it('create an absolute favicon url if the logo is not present', async () => {
    const html = await readFile(resolve(__dirname, 'fixtures/input.html'))
    const url = 'https://microlink.io'
    const meta = await metascraper({ url, html })
    should(meta.logo).be.equal('https://microlink.io/favicon.ico')
  })
})
